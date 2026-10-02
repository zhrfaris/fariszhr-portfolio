import { NextResponse } from "next/server";
import { prod404 } from "@/components/dev-annotations/server/guard";
import { readRunState } from "@/components/dev-annotations/server/store";

export async function GET() {
  const blocked = prod404();
  if (blocked) return blocked;
  const state = await readRunState();
  return NextResponse.json(state);
}
