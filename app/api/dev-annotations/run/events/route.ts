import { NextRequest } from "next/server";
import { prod404 } from "@/components/dev-annotations/server/guard";
import { subscribe } from "@/components/dev-annotations/server/bus";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const blocked = prod404();
  if (blocked) return blocked;

  const runId = req.nextUrl.searchParams.get("runId");
  if (!runId) {
    return new Response("Missing runId", { status: 400 });
  }

  const encoder = new TextEncoder();
  let unsubscribe: (() => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: unknown) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          // controller already closed
        }
      };

      unsubscribe = subscribe(runId, (event) => {
        send(event);
        if (event.type === "done" || event.type === "error") {
          unsubscribe?.();
          try {
            controller.close();
          } catch {
            // already closed
          }
        }
      });

      req.signal.addEventListener("abort", () => {
        unsubscribe?.();
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
    cancel() {
      unsubscribe?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
