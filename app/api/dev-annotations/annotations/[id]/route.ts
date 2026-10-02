import { NextRequest, NextResponse } from "next/server";
import { prod404 } from "@/components/dev-annotations/server/guard";
import {
  nowIso,
  readAnnotations,
  writeAnnotations,
} from "@/components/dev-annotations/server/store";
import { AnnotationStatus } from "@/components/dev-annotations/types";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const blocked = prod404();
  if (blocked) return blocked;

  const { id } = await params;
  const body = await req.json();
  const annotations = await readAnnotations();
  const annotation = annotations.find((a) => a.id === id);
  if (!annotation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.action === "reply") {
    const text = String(body.text ?? "").trim();
    if (!text) {
      return NextResponse.json({ error: "Empty reply" }, { status: 400 });
    }
    annotation.thread.push({
      id: crypto.randomUUID(),
      author: "user",
      kind: "comment",
      text,
      createdAt: nowIso(),
    });
    // Replying to a Claude question re-opens the thread so it joins the next run.
    if (annotation.status === "needs-reply") annotation.status = "open";
  } else if (body.action === "setStatus") {
    annotation.status = body.status as AnnotationStatus;
  } else {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  annotation.updatedAt = nowIso();
  await writeAnnotations(annotations);
  return NextResponse.json(annotation);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const blocked = prod404();
  if (blocked) return blocked;

  const { id } = await params;
  const annotations = await readAnnotations();
  const next = annotations.filter((a) => a.id !== id);
  await writeAnnotations(next);
  return NextResponse.json({ ok: true });
}
