import { PH, PW } from "./page-metrics";

/**
 * GLSL ported verbatim from docs/design/portfolio-scroll-prototype.html, with
 * the page metrics interpolated in rather than hardcoded.
 *
 * Colour management note: these are raw ShaderMaterials, so three injects none
 * of its colour-space chunks — a texel is sampled as authored, shaded, and
 * written straight out. That is the pipeline the lighting constants below were
 * tuned against, so the textures deliberately keep their default colour space.
 */

/** The sheet folds around a cylinder instead of pivoting flat. */
export const CURL_VERT = /* glsl */ `
#define PI 3.14159265359
uniform vec2 uMid; uniform vec2 uDir; uniform float uR;
varying vec2 vUv; varying vec3 vN; varying float vBend; varying vec2 vFlat;
void main(){
  vUv = uv;
  vec2 p = position.xy, xy = p;
  float z = 0.0, bend = 0.0;
  vec3 n = vec3(0.0,0.0,1.0);
  float s = dot(p - uMid, uDir);
  if (s < 0.0){
    float u = -s, a, na, nz;
    if (u < PI*uR){
      float b = u/uR;
      a  = -uR*sin(b);  z = uR*(1.0-cos(b));
      na =  sin(b);     nz = cos(b);
      bend = 1.0 - abs(cos(b));
    } else {
      a = u - PI*uR;    z = 2.0*uR;
      na = 0.0;         nz = -1.0;
    }
    xy = p + uDir*(a + u);
    n  = normalize(vec3(uDir*na, nz));
  }
  vBend = bend; vFlat = p;
  vN = normalize(normalMatrix * n);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(xy, z, 1.0);
}`;

/* One light and one gutter model, shared by the folding sheet and the flat
   pages. That is the only way the hand-off at 0% and 100% stays invisible. */
const PAPER_GLSL = /* glsl */ `
const vec3 LIGHT = vec3(-0.26, 0.46, 0.85);
float lambert(vec3 N){
  float d = dot(N, normalize(LIGHT));
  return mix(clamp((d+0.55)/1.55, 0.0, 1.0), clamp(d, 0.0, 1.0), 0.5);
}
float sheen(vec3 N, vec3 V){
  vec3 H = normalize(normalize(LIGHT) + V);
  return pow(clamp(dot(N,H), 0.0, 1.0), 26.0) * 0.045;
}
float gutter(vec2 p){
  float g = smoothstep(0.0, 0.13, abs(p.x));
  float e = smoothstep(0.0, 0.035, ${PW.toFixed(3)} - abs(p.x));
  return mix(0.905, 1.0, g) * mix(0.955, 1.0, e);
}`;

export const CURL_FRAG =
  PAPER_GLSL +
  /* glsl */ `
uniform sampler2D uFront; uniform sampler2D uBack; uniform float uProgress;
varying vec2 vUv; varying vec3 vN; varying float vBend; varying vec2 vFlat;
void main(){
  bool front = gl_FrontFacing;
  float land = smoothstep(0.90, 1.0, uProgress);
  vec3 col = front ? texture2D(uFront, vUv).rgb
                   : texture2D(uBack, vec2(1.0-vUv.x, vUv.y)).rgb * mix(0.972, 1.0, land);
  vec3 N = normalize(vN); if(!front) N = -N;
  col *= (0.74 + 0.30*lambert(N)) * (1.0 - vBend*0.13);
  col += sheen(N, vec3(0.0, 0.0, 1.0));
  col *= gutter(vFlat);
  gl_FragColor = vec4(col, 1.0);
}`;

export const FLAT_VERT = /* glsl */ `
varying vec2 vUv; varying vec2 vPos; varying vec3 vN;
void main(){ vUv = uv; vPos = position.xy;
  vN = normalize(normalMatrix * vec3(0.0, 0.0, 1.0));
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;

/** The flat pages carry the fold's cast shadow, reprojected from the sheet. */
export const FLAT_FRAG =
  PAPER_GLSL +
  /* glsl */ `
#define PI 3.14159265359
uniform sampler2D uMap;
uniform vec2 uMid; uniform vec2 uDir;
uniform float uR; uniform float uHalf; uniform float uProgress;
uniform float uSide; uniform float uActive; uniform float uAmt;
varying vec2 vUv; varying vec2 vPos; varying vec3 vN;
float onSheet(vec2 p, float e){
  float x = p.x * uSide;
  float mx = smoothstep(-e, e, x) * (1.0 - smoothstep(${PW.toFixed(3)} - e, ${PW.toFixed(3)} + e, x));
  float my = 1.0 - smoothstep(${(PH / 2).toFixed(4)} - e, ${(PH / 2).toFixed(4)} + e, abs(p.y));
  return mx * my;
}
void main(){
  vec3 col = texture2D(uMap, vUv).rgb;
  if (uActive > 0.5){
    float s = dot(vPos - uMid, uDir);
    float arc  = min(uHalf / uR, PI);
    float lift = uR * (1.0 - cos(arc));
    float back  = -uR * sin(min(uHalf / uR, PI * 0.5));
    float front = max(uHalf - PI * uR, 0.0);
    float pen   = 0.03 + uR;
    vec2 src = (s >= 0.0) ? vPos - 2.0*s*uDir : vPos - s*uDir;
    float m = onSheet(src, pen * 0.8);
    m *= smoothstep(back - pen, back + pen*0.35, s);
    m *= 1.0 - smoothstep(front - pen*0.35, front + pen, s);
    float core = exp(-abs(s) / (uR*1.5 + 0.02));
    float base = clamp(uR * 3.6, 0.0, 0.5);
    float sh   = m * (base + (1.0 - base) * core);
    float amt = uAmt * smoothstep(0.0, uR * 0.45, lift) * (1.0 - smoothstep(0.88, 1.0, uProgress));
    col *= 1.0 - amt * clamp(sh, 0.0, 1.0);
  }
  vec3 N = normalize(vN);
  col *= 0.74 + 0.30*lambert(N);
  col += sheen(N, vec3(0.0, 0.0, 1.0));
  col *= gutter(vPos);
  gl_FragColor = vec4(col, 1.0);
}`;

/** The block of leaves under each half, so the fold has something to lift away from. */
export const BLOCK = 0.021;

export const BLOCK_VERT = /* glsl */ `
varying vec3 vLocal; varying vec3 vNb;
void main(){ vLocal = position; vNb = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

export const BLOCK_FRAG =
  PAPER_GLSL +
  /* glsl */ `
varying vec3 vLocal; varying vec3 vNb;
void main(){
  float deep = clamp(-vLocal.z / ${BLOCK.toFixed(3)}, 0.0, 1.0);
  vec3 col = mix(vec3(0.949,0.945,0.937), vec3(0.663,0.657,0.643), deep);
  col *= 0.94 + 0.06*sin(vLocal.z * 760.0);
  col *= 0.58 + 0.46*lambert(normalize(vNb));
  gl_FragColor = vec4(col, 1.0);
}`;
