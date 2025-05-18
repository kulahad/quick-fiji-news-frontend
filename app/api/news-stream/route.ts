import { fetchSingleFeed, RSS_SOURCES } from "@/lib/rssService";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send initial response immediately
        controller.enqueue(
          encoder.encode(JSON.stringify({ type: "start" }) + "\n")
        );

        // Process each source sequentially
        for (const source of RSS_SOURCES) {
          try {
            const items = await fetchSingleFeed(source);
            if (items && items.length > 0) {
              // Send chunk of data
              const chunk = encoder.encode(
                JSON.stringify({
                  type: "chunk",
                  source,
                  items,
                }) + "\n"
              );
              controller.enqueue(chunk);
            }
          } catch (sourceError) {
            console.error(`Error fetching ${source}:`, sourceError);
            // Send error for this source but continue
            controller.enqueue(
              encoder.encode(
                JSON.stringify({
                  type: "error",
                  source,
                  error:
                    typeof sourceError === "object" &&
                    sourceError &&
                    "message" in sourceError
                      ? (sourceError as { message: string }).message
                      : String(sourceError),
                }) + "\n"
              )
            );
            continue;
          }

          // Small delay between sources to prevent overwhelming the client
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error("Stream error:", error);
        controller.error(error);
      } finally {
        // Send end message
        controller.enqueue(
          encoder.encode(JSON.stringify({ type: "end" }) + "\n")
        );
        controller.close();
      }
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
