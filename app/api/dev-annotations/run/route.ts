import { NextResponse } from "next/server";
import { prod404 } from "@/components/dev-annotations/server/guard";
import {
  nowIso,
  readAnnotations,
  readRunState,
  writeRunState,
} from "@/components/dev-annotations/server/store";
import {
  getBranch,
  isGitRepo,
  snapshotWorkingTree,
} from "@/components/dev-annotations/server/git";
import { startRun } from "@/components/dev-annotations/server/runner";

export async function POST() {
  const blocked = prod404();
  if (blocked) return blocked;

  const state = await readRunState();
  if (state.phase === "running") {
    return NextResponse.json(
      { error: "A run is already in progress" },
      { status: 409 }
    );
  }
  if (state.phase === "awaiting-review") {
    return NextResponse.json(
      { error: "Finish the current review (Simpan/Batalkan) first" },
      { status: 409 }
    );
  }

  if (!(await isGitRepo())) {
    return NextResponse.json(
      { error: "Not a git repository — snapshots are required" },
      { status: 400 }
    );
  }

  const annotations = await readAnnotations();
  const open = annotations.filter((a) => a.status === "open");
  if (open.length === 0) {
    return NextResponse.json(
      { error: "No open annotations to send" },
      { status: 400 }
    );
  }

  // Snapshot the full working tree BEFORE any edits (no commit on the branch).
  const branch = await getBranch();
  const snapshot = await snapshotWorkingTree();
  const runId = crypto.randomUUID();

  await writeRunState({
    phase: "running",
    runId,
    branch,
    preRunHead: snapshot.head,
    snapshotCommit: snapshot.commit,
    annotationIds: open.map((a) => a.id),
    startedAt: nowIso(),
    finishedAt: null,
    error: null,
  });

  // Fire-and-forget; progress streams over SSE.
  startRun(runId, open);

  return NextResponse.json({ runId });
}
