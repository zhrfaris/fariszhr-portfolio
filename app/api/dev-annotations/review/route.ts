import { NextRequest, NextResponse } from "next/server";
import { prod404 } from "@/components/dev-annotations/server/guard";
import {
  nowIso,
  readAnnotations,
  readRunState,
  resetRunState,
  writeAnnotations,
} from "@/components/dev-annotations/server/store";
import {
  commitRunDelta,
  restoreWorkingTree,
} from "@/components/dev-annotations/server/git";

export async function POST(req: NextRequest) {
  const blocked = prod404();
  if (blocked) return blocked;

  const { action } = await req.json();
  const state = await readRunState();

  if (state.phase !== "awaiting-review" || !state.snapshotCommit) {
    return NextResponse.json(
      { error: "No run is awaiting review" },
      { status: 409 }
    );
  }

  const annotations = await readAnnotations();
  const inRun = annotations.filter((a) => state.annotationIds.includes(a.id));
  const fixed = inRun.filter((a) => a.status === "pending-review");

  if (action === "simpan") {
    // Commit message: resolved numbers + their resolution notes.
    const numbers = fixed.map((a) => `#${a.number}`).join(", ");
    const noteLines = fixed.map((a) => {
      const note =
        [...a.thread].reverse().find((m) => m.kind === "resolution")?.text ??
        "resolved";
      return `#${a.number}: ${note}`;
    });
    const message =
      `dev-annotations: resolve ${numbers}`.trim() +
      (noteLines.length ? `\n\n${noteLines.join("\n")}` : "");

    const result = await commitRunDelta(state.snapshotCommit, message);

    for (const a of fixed) {
      a.status = "resolved";
      a.updatedAt = nowIso();
    }
    await writeAnnotations(annotations);
    await resetRunState();

    return NextResponse.json({
      ok: true,
      committed: result?.commit ?? null,
      paths: result?.paths ?? [],
      resolved: fixed.map((a) => a.number),
    });
  }

  if (action === "batalkan") {
    await restoreWorkingTree(state.snapshotCommit);

    // Fixed-but-not-saved annotations go back to open for the next run.
    for (const a of fixed) {
      a.status = "open";
      a.updatedAt = nowIso();
    }
    await writeAnnotations(annotations);
    await resetRunState();

    return NextResponse.json({ ok: true, reverted: fixed.map((a) => a.number) });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
