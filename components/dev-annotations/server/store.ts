// Server-only module (imported solely by dev API route handlers). Guarded by
// assertDev() rather than the `server-only` package to avoid a new dependency.
import { promises as fs } from "fs";
import path from "path";
import { Annotation, RunState } from "../types";

/** Throw if ever called outside development. Every route also 404s, this is a
 * defense-in-depth guard around the fs/git/spawn helpers. */
export function assertDev() {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("dev-annotations is development-only");
  }
}

export const PROJECT_ROOT = process.cwd();
export const ANNOTATIONS_DIR = path.join(PROJECT_ROOT, ".annotations");
const ANNOTATIONS_FILE = path.join(ANNOTATIONS_DIR, "annotations.json");
const RUN_STATE_FILE = path.join(ANNOTATIONS_DIR, "run-state.json");
export const RUN_REPORT_FILE = path.join(ANNOTATIONS_DIR, "run-report.json");

const DEFAULT_RUN_STATE: RunState = {
  phase: "idle",
  runId: null,
  branch: null,
  preRunHead: null,
  snapshotCommit: null,
  annotationIds: [],
  startedAt: null,
  finishedAt: null,
  error: null,
};

async function ensureDir() {
  await fs.mkdir(ANNOTATIONS_DIR, { recursive: true });
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, data: unknown) {
  await ensureDir();
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf8");
}

export async function readAnnotations(): Promise<Annotation[]> {
  assertDev();
  return readJson<Annotation[]>(ANNOTATIONS_FILE, []);
}

export async function writeAnnotations(annotations: Annotation[]) {
  assertDev();
  await writeJson(ANNOTATIONS_FILE, annotations);
}

export async function readRunState(): Promise<RunState> {
  assertDev();
  return readJson<RunState>(RUN_STATE_FILE, DEFAULT_RUN_STATE);
}

export async function writeRunState(state: RunState) {
  assertDev();
  await writeJson(RUN_STATE_FILE, state);
}

export async function resetRunState() {
  await writeRunState({ ...DEFAULT_RUN_STATE });
}

/** Next annotation number = max existing + 1 (numbers are stable, never reused). */
export function nextNumber(annotations: Annotation[]): number {
  return annotations.reduce((max, a) => Math.max(max, a.number), 0) + 1;
}

export function nowIso() {
  // Date is fine here — this runs in a Next route handler, not a workflow script.
  return new Date().toISOString();
}
