// Client-side fetch helpers for the dev annotation API routes.
import { Annotation, AnnotationTarget, RunState } from "../types";

const BASE = "/api/dev-annotations";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const body = await res.json();
      msg = body.error ?? msg;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export function fetchAnnotations(): Promise<Annotation[]> {
  return fetch(`${BASE}/annotations`).then((r) => json<Annotation[]>(r));
}

export function createAnnotation(payload: {
  page: Annotation["page"];
  target: AnnotationTarget;
  text: string;
}): Promise<Annotation> {
  return fetch(`${BASE}/annotations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then((r) => json<Annotation>(r));
}

export function replyAnnotation(id: string, text: string): Promise<Annotation> {
  return fetch(`${BASE}/annotations/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "reply", text }),
  }).then((r) => json<Annotation>(r));
}

export function setAnnotationStatus(
  id: string,
  status: Annotation["status"]
): Promise<Annotation> {
  return fetch(`${BASE}/annotations/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "setStatus", status }),
  }).then((r) => json<Annotation>(r));
}

export function deleteAnnotation(id: string): Promise<{ ok: boolean }> {
  return fetch(`${BASE}/annotations/${id}`, { method: "DELETE" }).then((r) =>
    json<{ ok: boolean }>(r)
  );
}

export function fetchState(): Promise<RunState> {
  return fetch(`${BASE}/state`).then((r) => json<RunState>(r));
}

export function startRun(): Promise<{ runId: string }> {
  return fetch(`${BASE}/run`, { method: "POST" }).then((r) =>
    json<{ runId: string }>(r)
  );
}

export function review(
  action: "simpan" | "batalkan"
): Promise<{ ok: boolean }> {
  return fetch(`${BASE}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  }).then((r) => json<{ ok: boolean }>(r));
}
