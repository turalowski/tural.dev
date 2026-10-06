import fs from "fs";
import { POSTS_DIR } from "@/app/lib/blog";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Dev-only: streams an event whenever a file under the posts directory changes,
// so the browser can refresh server-rendered markdown without a manual reload.
export function GET(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return new Response("Not found", { status: 404 });
  }

  const encoder = new TextEncoder();
  let watcher: fs.FSWatcher | undefined;
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(": connected\n\n"));

      watcher = fs.watch(POSTS_DIR, { recursive: true }, () => {
        // Editors often emit several events per save; collapse them into one.
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          controller.enqueue(encoder.encode("data: change\n\n"));
        }, 100);
      });

      request.signal.addEventListener("abort", () => {
        clearTimeout(timeout);
        watcher?.close();
        controller.close();
      });
    },
    cancel() {
      clearTimeout(timeout);
      watcher?.close();
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
