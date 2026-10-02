import { NextRequest, NextResponse } from "next/server";
import { prod404 } from "@/components/dev-annotations/server/guard";
import {
  nextNumber,
  nowIso,
  readAnnotations,
  writeAnnotations,
} from "@/components/dev-annotations/server/store";
import { Annotation } from "@/components/dev-annotations/types";

export async function GET() {
  const blocked = prod404();
  if (blocked) return blocked;
  const annotations = await readAnnotations();
  return NextResponse.json(annotations);
}

export async function POST(req: NextRequest) {
  const blocked = prod404();
  if (blocked) return blocked;

  const body = await req.json();
  const annotations = await readAnnotations();

  const annotation: Annotation = {
    id: crypto.randomUUID(),
    number: nextNumber(annotations),
    createdAt: nowIso(),
    updatedAt: nowIso(),
    status: "open",
    page: body.page,
    target: body.target,
    thread: [
      {
        id: crypto.randomUUID(),
        author: "user",
        kind: "comment",
        text: String(body.text ?? "").trim(),
        createdAt: nowIso(),
      },
    ],
  };

  annotations.push(annotation);
  await writeAnnotations(annotations);
  return NextResponse.json(annotation, { status: 201 });
}
