// In-memory event bus for streaming run progress to the panel over SSE. Dev is
// a single Node process, so a module singleton works; we hang it off globalThis
// so it survives HMR module re-evaluation.
import { RunEvent } from "../types";

interface RunChannel {
  events: RunEvent[];
  listeners: Set<(e: RunEvent) => void>;
  ended: boolean;
}

interface Bus {
  runs: Map<string, RunChannel>;
}

const g = globalThis as unknown as { __devAnnoBus?: Bus };
const bus: Bus = (g.__devAnnoBus ??= { runs: new Map() });

function channel(runId: string): RunChannel {
  let ch = bus.runs.get(runId);
  if (!ch) {
    ch = { events: [], listeners: new Set(), ended: false };
    bus.runs.set(runId, ch);
  }
  return ch;
}

export function createRun(runId: string) {
  const ch = channel(runId);
  ch.events = [];
  ch.ended = false;
}

export function publish(runId: string, event: RunEvent) {
  const ch = channel(runId);
  ch.events.push(event);
  if (event.type === "done" || event.type === "error") ch.ended = true;
  ch.listeners.forEach((l) => l(event));
}

/** Subscribe, replaying any buffered events first. Returns an unsubscribe fn. */
export function subscribe(
  runId: string,
  cb: (e: RunEvent) => void
): () => void {
  const ch = channel(runId);
  // replay backlog
  for (const e of ch.events) cb(e);
  ch.listeners.add(cb);
  return () => ch.listeners.delete(cb);
}

export function isEnded(runId: string): boolean {
  return channel(runId).ended;
}
