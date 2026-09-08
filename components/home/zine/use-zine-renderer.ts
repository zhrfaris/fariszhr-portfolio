"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import * as THREE from "three";

import { ZINE_PAGES } from "@/content/home";
import { setZineDragging } from "./drag-state";
import { FH, FW, PH, PW, R_MAX, R_MIN } from "./page-metrics";
import { PageTextures } from "./page-textures";
import {
  BLOCK,
  BLOCK_FRAG,
  BLOCK_VERT,
  CURL_FRAG,
  CURL_VERT,
  FLAT_FRAG,
  FLAT_VERT,
} from "./shaders";

/**
 * The zine's page turn.
 *
 * Ported from docs/design/portfolio-scroll-prototype.html. The sheet folds
 * around a cylinder rather than pivoting flat, and once you let go it is
 * dropped and left to fall rather than tweened, so it settles like paper.
 */

/** Twelve page faces read as six spreads, so there are five turns. */
export const SPREAD_COUNT = Math.ceil(ZINE_PAGES.length / 2);

/**
 * Idle hint. The corner lifts a little way and settles back, so the book says
 * it can be grabbed without anyone having to guess. It reuses the real fold —
 * begin() sets it up exactly as a drag would and the frame loop drives the
 * grab point along a scripted curve instead of from a pointer — so the curl,
 * the shading and the paper all behave as they do under the hand.
 *
 * Deliberately restrained: it waits for a real pause, reaches under a tenth of
 * a full turn, and gives up after a few goes rather than nagging.
 */
const NUDGE_FIRST_MS = 6000;
const NUDGE_EVERY_MS = 18000;
const NUDGE_LIMIT = 3;
const NUDGE_REACH = 0.08;
const NUDGE_OUT = 420;
const NUDGE_HOLD = 240;
const NUDGE_BACK = 560;
/** low on the page, so it reads as a corner being picked up */
const NUDGE_GRAB_Y = -PH * 0.3;

const SHADOW = 0.46;

/* ---------- what happens after you let go ----------
   -G·sin(2πp)  tipping torque: nil lying flat either way, nil at the balance
                point, strongest between — a page let go just past centre
                hesitates, then commits.
   squeeze      air trapped under the falling sheet has to escape, so
                resistance climbs steeply near contact. Paper settles; it
                does not slap down.                                        */
const G_TIP = 6.0;
const K_LAND = 52.0;
const DRAG_AIR = 3.0;
const SQUEEZE = 26.0;
const SEAT = 4.0;
const FLICK = 3.45;

type Turn = { dir: 1 | -1; C: THREE.Vector2; P: THREE.Vector2; progress: number };
type Sim = { dir: THREE.Vector2; p: number; v: number; t: number; instant: boolean };

export const useZineRenderer = ({
  stageRef,
  canvasRef,
  sheetRef,
}: {
  stageRef: RefObject<HTMLDivElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  /** The paper. It carries the drag; the canvas takes no pointer events. */
  sheetRef: RefObject<HTMLDivElement>;
}) => {
  const [spread, setSpread] = useState(0);
  const [supported, setSupported] = useState<boolean | null>(null);
  /* Until (or unless) the scene comes up, turning is plain state — that keeps
     the nav working on a machine with no WebGL, where the fallback below shows
     the spread as two images. */
  const turnToRef = useRef<(dir: 1 | -1) => void>((dir) =>
    setSpread((s) => (s + dir + SPREAD_COUNT) % SPREAD_COUNT),
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    const sheet = sheetRef.current;
    if (!canvas || !stage || !sheet) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch {
      setSupported(false);
      return;
    }
    setSupported(true);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(17, 1, 0.1, 100);
    const book = new THREE.Group();
    scene.add(book);

    const tex = new PageTextures(
      renderer.capabilities.getMaxAnisotropy(),
      () => {
        // a page that lands mid-read has to be pushed into whichever slot wants it
        refreshMaps();
      },
    );

    /* ---------- geometry ---------- */
    const flatGeo = (side: "L" | "R") => {
      const g = new THREE.PlaneGeometry(PW, PH, 1, 1);
      g.translate(side === "R" ? PW / 2 : -PW / 2, 0, 0);
      return g;
    };
    const foldGeo = (side: "L" | "R") => {
      const g = new THREE.PlaneGeometry(PW, PH, 52, 40);
      g.translate(side === "R" ? PW / 2 : -PW / 2, 0, 0);
      return g;
    };

    const shadowU = () => ({
      uMap: { value: tex.placeholder as THREE.Texture },
      uMid: { value: new THREE.Vector2() },
      uDir: { value: new THREE.Vector2(-1, 0) },
      uR: { value: R_MAX },
      uHalf: { value: 0 },
      uProgress: { value: 0 },
      uSide: { value: 1 },
      uActive: { value: 0 },
      uAmt: { value: SHADOW },
    });

    const leftMat = new THREE.ShaderMaterial({
      vertexShader: FLAT_VERT,
      fragmentShader: FLAT_FRAG,
      uniforms: shadowU(),
    });
    const rightMat = new THREE.ShaderMaterial({
      vertexShader: FLAT_VERT,
      fragmentShader: FLAT_FRAG,
      uniforms: shadowU(),
    });

    const geoL = flatGeo("L");
    const geoR = flatGeo("R");
    const pageL = new THREE.Mesh(geoL, leftMat);
    const pageR = new THREE.Mesh(geoR, rightMat);
    pageL.position.z = pageR.position.z = 0.002;
    book.add(pageL, pageR);

    const blockMat = new THREE.ShaderMaterial({
      vertexShader: BLOCK_VERT,
      fragmentShader: BLOCK_FRAG,
    });
    const blockGeos = ([
      ["L", -PW / 2],
      ["R", PW / 2],
    ] as const).map(([, x]) => {
      const g = new THREE.BoxGeometry(PW, PH, BLOCK);
      g.translate(x, 0, -BLOCK / 2 + 0.0005);
      book.add(new THREE.Mesh(g, blockMat));
      return g;
    });

    const foldMat = new THREE.ShaderMaterial({
      vertexShader: CURL_VERT,
      fragmentShader: CURL_FRAG,
      side: THREE.DoubleSide,
      uniforms: {
        uFront: { value: tex.placeholder as THREE.Texture },
        uBack: { value: tex.placeholder as THREE.Texture },
        uProgress: { value: 0 },
        uMid: { value: new THREE.Vector2(PW, 0) },
        uDir: { value: new THREE.Vector2(-1, 0) },
        uR: { value: R_MAX },
      },
    });
    const gR = foldGeo("R");
    const gL = foldGeo("L");
    const fold = new THREE.Mesh(gR, foldMat);
    fold.position.z = 0.005;
    fold.visible = false;
    book.add(fold);

    /* ---------- turn state ---------- */
    let current = 0;
    let turn: Turn | null = null;
    let sim: Sim | null = null;
    let dragging = false;
    let nudge: { t0: number } | null = null;
    let nudgeCount = 0;
    let idleTimer: ReturnType<typeof setTimeout> | undefined;
    const wantsMotion = !window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    let moved = false;
    let downPt: { x: number; y: number } | null = null;
    let vel = 0;
    let velAt: { t: number; p: number } | null = null;

    const setDrag = (v: boolean) => {
      dragging = v;
      setZineDragging(v);
    };

    /** Push whatever artwork is currently available into the visible slots. */
    function refreshMaps() {
      if (turn) return; // mid-turn the maps are owned by begin()
      leftMat.uniforms.uMap.value = tex.get(current * 2);
      rightMat.uniforms.uMap.value = tex.get(current * 2 + 1);
    }

    function rest() {
      turn = null;
      fold.visible = false;
      leftMat.uniforms.uActive.value = rightMat.uniforms.uActive.value = 0;
      refreshMaps();
      tex.loadAround(current);
      setSpread(current);
    }

    /* No boundary refusal: PageTextures wraps the indices, so a turn off either
       end folds exactly like any other turn and lands on the opposite spread. */
    function begin(d: 1 | -1, gy: number) {
      const k = current;
      if (d > 0) {
        leftMat.uniforms.uMap.value = tex.get(2 * k);
        rightMat.uniforms.uMap.value = tex.get(2 * k + 3);
        foldMat.uniforms.uFront.value = tex.get(2 * k + 1);
        foldMat.uniforms.uBack.value = tex.get(2 * k + 2);
        fold.geometry = gR;
        turn = {
          dir: 1,
          C: new THREE.Vector2(PW, gy),
          P: new THREE.Vector2(PW, gy),
          progress: 0,
        };
      } else {
        leftMat.uniforms.uMap.value = tex.get(2 * k - 2);
        rightMat.uniforms.uMap.value = tex.get(2 * k + 1);
        foldMat.uniforms.uFront.value = tex.get(2 * k);
        foldMat.uniforms.uBack.value = tex.get(2 * k - 1);
        fold.geometry = gL;
        turn = {
          dir: -1,
          C: new THREE.Vector2(-PW, gy),
          P: new THREE.Vector2(-PW, gy),
          progress: 0,
        };
      }
      fold.visible = true;
      leftMat.uniforms.uActive.value = rightMat.uniforms.uActive.value = 1;
      apply();
      return true;
    }

    /* A page is bound at the spine. Any crease that puts part of the spine edge
       on the moving side would be tearing the sheet out of the binding, which is
       what a hard diagonal pull used to look like. The whole spine edge stays
       put when -(mid·u) >= |u.y|·PH/2; a short bisection finds the steepest
       crease that still satisfies it, and as a bonus the fold squares itself up
       at full reach. */
    const creaseOk = (C: THREE.Vector2, axisX: number, L: number, phi: number) => {
      const ux = axisX * Math.cos(phi);
      const uy = Math.sin(phi);
      const mx = C.x + ux * L * 0.5;
      const my = C.y + uy * L * 0.5;
      return -(mx * ux + my * uy) >= Math.abs(uy) * PH * 0.5 - 1e-6;
    };

    const creaseAngle = (C: THREE.Vector2, axisX: number, L: number, phi: number) => {
      if (creaseOk(C, axisX, L, phi)) return phi;
      let lo = 0;
      let hi = phi;
      for (let i = 0; i < 16; i++) {
        const m = (lo + hi) * 0.5;
        if (creaseOk(C, axisX, L, m)) lo = m;
        else hi = m;
      }
      return lo;
    };

    function apply() {
      if (!turn) return;
      const { C, P } = turn;
      const axisX = -turn.dir;
      let vx = P.x - C.x;
      let vy = P.y - C.y;
      let len = Math.sqrt(vx * vx + vy * vy);
      if (len < 1e-4) {
        len = 1e-4;
        vx = axisX * len;
        vy = 0;
      }

      const phi = creaseAngle(C, axisX, len, Math.atan2(vy, vx * axisX));
      const d = new THREE.Vector2(axisX * Math.cos(phi), Math.sin(phi));
      const progress = Math.min(len / (PW * 2), 1);
      const R = Math.max(0.01, R_MAX + (R_MIN - R_MAX) * progress);
      const mid = new THREE.Vector2(C.x + d.x * len * 0.5, C.y + d.y * len * 0.5);

      foldMat.uniforms.uMid.value.copy(mid);
      foldMat.uniforms.uDir.value.copy(d);
      foldMat.uniforms.uR.value = R;
      foldMat.uniforms.uProgress.value = progress;
      [leftMat, rightMat].forEach((m) => {
        m.uniforms.uMid.value.copy(mid);
        m.uniforms.uDir.value.copy(d);
        m.uniforms.uR.value = R;
        m.uniforms.uHalf.value = len * 0.5;
        m.uniforms.uProgress.value = progress;
        m.uniforms.uSide.value = turn!.dir;
        m.uniforms.uAmt.value = SHADOW;
      });
      turn.progress = progress;
    }

    /** Not a tween: the sheet is released and left to fall. */
    function letGo(v0: number) {
      if (!turn) return;
      const d = new THREE.Vector2().subVectors(turn.P, turn.C);
      if (d.lengthSq() < 1e-8) d.set(-turn.dir, 0);
      d.normalize();
      const p = turn.progress || 0;
      sim = reduce
        ? { dir: d, p: p + v0 * 0.15 > 0.5 ? 1 : 0, v: 0, t: 0, instant: true }
        : { dir: d, p, v: v0, t: 0, instant: false };
    }

    function integrate(h: number) {
      if (!sim) return;
      const goal = sim.v >= 0 ? 1 : 0;
      const gap = Math.abs(goal - sim.p);
      const pull = goal > 0.5 ? 1 : -1;
      let c = Math.max(0, 1 - gap / 0.3);
      c *= c;
      let q = Math.max(0, 1 - gap / 0.22);
      q *= q;
      const a =
        -G_TIP * Math.sin(2 * Math.PI * sim.p) +
        K_LAND * (goal - sim.p) * c +
        SEAT * pull * c -
        (DRAG_AIR + SQUEEZE * q) * sim.v;
      sim.v += a * h;
      sim.p += sim.v * h;
      sim.t += h;
    }

    function scheduleNudge(delay: number) {
      clearTimeout(idleTimer);
      if (!wantsMotion || nudgeCount >= NUDGE_LIMIT) return;
      idleTimer = setTimeout(startNudge, delay);
    }

    function startNudge() {
      // never over the top of a real interaction
      if (sim || turn || dragging) return scheduleNudge(NUDGE_EVERY_MS);
      if (!begin(1, NUDGE_GRAB_Y)) return scheduleNudge(NUDGE_EVERY_MS);
      nudgeCount += 1;
      nudge = { t0: performance.now() };
    }

    /** Drop the hint and put the page back down, so a real turn starts clean. */
    function stopNudge() {
      clearTimeout(idleTimer);
      if (!nudge) return;
      nudge = null;
      if (turn) finishTurn(false);
    }

    function auto(d: 1 | -1) {
      stopNudge();
      if (sim || turn) return;
      if (!begin(d, 0)) return;
      letGo(FLICK);
    }
    turnToRef.current = auto;

    function finishTurn(over: boolean) {
      if (!turn) return;
      const d = turn.dir;
      sim = null;
      if (over) current = (current + d + SPREAD_COUNT) % SPREAD_COUNT;
      rest();
    }

    /* ---------- pointer ---------- */
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const hitPt = new THREE.Vector3();
    const zPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const tilted = new THREE.Plane();

    const toBook = (ev: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      ndc.x = ((ev.clientX - r.left) / r.width) * 2 - 1;
      ndc.y = -((ev.clientY - r.top) / r.height) * 2 + 1;
      ray.setFromCamera(ndc, camera);
      tilted.copy(zPlane).applyMatrix4(book.matrixWorld);
      if (!ray.ray.intersectPlane(tilted, hitPt)) return null;
      return book.worldToLocal(hitPt.clone());
    };

    const endDrag = (ev?: PointerEvent) => {
      setDrag(false);
      delete sheet.dataset.grabbing;
      if (ev && sheet.hasPointerCapture(ev.pointerId))
        sheet.releasePointerCapture(ev.pointerId);
    };

    const onPointerDown = (ev: PointerEvent) => {
      stopNudge();
      if (sim) return;
      const p = toBook(ev);
      if (!p) return;
      if (Math.abs(p.y) > PH * 0.52 || Math.abs(p.x) > PW * 1.01) return;
      const gy = Math.max(-PH / 2, Math.min(PH / 2, p.y));
      if (!begin(p.x >= 0 ? 1 : -1, gy)) return;
      setDrag(true);
      moved = false;
      downPt = { x: ev.clientX, y: ev.clientY };
      vel = 0;
      velAt = null;
      sheet.dataset.grabbing = "true";
      /* Capture on the paper, so a drag keeps tracking once it leaves it —
         which every turn does. */
      sheet.setPointerCapture(ev.pointerId);
      // the canvas is the focusable element, so clicking the paper still
      // hands it focus and leaves the arrow keys working.
      // Flagged as pointer-driven first: Safari counts a scripted focus() as
      // :focus-visible, and the ring that draws is the canvas box — the whole
      // stage, 1.8x the book's height — so a touch drew a rectangle across
      // half the page. The flag suppresses the ring for this focus only; a
      // key press or a re-focus by Tab brings it straight back.
      canvas.dataset.pointerFocus = "true";
      canvas.focus({ preventScroll: true });
    };

    const onPointerMove = (ev: PointerEvent) => {
      if (!dragging || !turn) return;
      if (downPt && Math.hypot(ev.clientX - downPt.x, ev.clientY - downPt.y) > 5)
        moved = true;
      const p = toBook(ev);
      if (!p) return;
      let dx = p.x - turn.C.x;
      const dy = p.y - turn.C.y;
      dx = turn.dir > 0 ? Math.min(dx, 0) : Math.max(dx, 0);
      const v = new THREE.Vector2(dx, dy);
      if (v.length() > PW * 2) v.setLength(PW * 2);
      turn.P.set(turn.C.x + v.x, turn.C.y + v.y);
      apply();

      // hand the drag straight through the changeover: at full reach the sheet
      // is already square on the one beneath, so swapping here is invisible
      if (turn.progress >= 0.9995) {
        finishTurn(true);
        endDrag(ev);
        return;
      }

      const now = performance.now();
      if (velAt) {
        const h = Math.max(now - velAt.t, 8) / 1000;
        vel = vel * 0.5 + ((turn.progress - velAt.p) / h) * 0.5;
      }
      velAt = { t: now, p: turn.progress };
      ev.preventDefault();
    };

    const release = (ev: PointerEvent) => {
      if (!dragging) return;
      endDrag(ev);
      if (!turn) return;
      if (velAt && performance.now() - velAt.t > 90) vel = 0; // hand had already stopped
      letGo(moved ? vel : FLICK);
    };

    /* Focus is only "pointer-driven" until the reader reaches for a key, or
       leaves and comes back — either way the ring is theirs again. */
    const clearPointerFocus = () => {
      delete canvas.dataset.pointerFocus;
    };

    canvas.addEventListener("keydown", clearPointerFocus);
    canvas.addEventListener("blur", clearPointerFocus);

    sheet.addEventListener("pointerdown", onPointerDown);
    sheet.addEventListener("pointermove", onPointerMove);
    sheet.addEventListener("pointerup", release);
    sheet.addEventListener("pointercancel", release);

    /* ---------- render loop ---------- */
    const resize = () => {
      const r = stage.getBoundingClientRect();
      if (!r.width || !r.height) return;
      renderer.setSize(r.width, r.height, false);
      camera.aspect = r.width / r.height;
      const half = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
      camera.position.set(
        0,
        0,
        Math.max(FH / 2 / half, FW / 2 / (half * camera.aspect)),
      );
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(stage);
    window.addEventListener("resize", resize);

    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(now - last, 48);
      last = now;

      if (nudge && turn && !dragging && !sim) {
        const t = now - nudge.t0;
        const span = NUDGE_OUT + NUDGE_HOLD + NUDGE_BACK;
        let k: number;
        if (t < NUDGE_OUT) {
          k = 1 - Math.pow(1 - t / NUDGE_OUT, 3);
        } else if (t < NUDGE_OUT + NUDGE_HOLD) {
          k = 1;
        } else {
          const b = (t - NUDGE_OUT - NUDGE_HOLD) / NUDGE_BACK;
          k = 1 - (b < 0.5 ? 4 * b * b * b : 1 - Math.pow(-2 * b + 2, 3) / 2);
        }
        turn.P.set(turn.C.x - PW * 2 * NUDGE_REACH * k, turn.C.y);
        apply();
        if (t >= span) {
          nudge = null;
          finishTurn(false);
          scheduleNudge(NUDGE_EVERY_MS);
        }
      }

      if (sim && turn) {
        if (sim.instant || sim.p >= 1 || sim.p <= 0) {
          finishTurn(sim.p > 0.5);
        } else {
          // fixed sub-steps, so the fall is identical on 60Hz and 120Hz
          let left = dt / 1000;
          while (left > 0) {
            const h = Math.min(left, 1 / 240);
            integrate(h);
            left -= h;
            if (sim.p >= 1 || sim.p <= 0) break;
          }
          if (sim.p >= 1 || sim.p <= 0 || sim.t > 4) finishTurn(sim.p > 0.5);
          else {
            turn.P.copy(turn.C).addScaledVector(sim.dir, sim.p * PW * 2);
            apply();
          }
        }
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    };

    resize();
    rest();
    scheduleNudge(NUDGE_FIRST_MS);
    raf = requestAnimationFrame(frame);

    return () => {
      clearTimeout(idleTimer);
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", resize);
      sheet.removeEventListener("pointerdown", onPointerDown);
      sheet.removeEventListener("pointermove", onPointerMove);
      sheet.removeEventListener("pointerup", release);
      sheet.removeEventListener("pointercancel", release);
      canvas.removeEventListener("keydown", clearPointerFocus);
      canvas.removeEventListener("blur", clearPointerFocus);
      setZineDragging(false);
      [geoL, geoR, gL, gR, ...blockGeos].forEach((g) => g.dispose());
      [leftMat, rightMat, foldMat, blockMat].forEach((m) => m.dispose());
      tex.dispose();
      renderer.dispose();
    };
  }, [canvasRef, stageRef, sheetRef]);

  const turn = useCallback((dir: 1 | -1) => turnToRef.current(dir), []);

  return {
    spread,
    spreadCount: SPREAD_COUNT,
    supported,
    turn,
  };
};
