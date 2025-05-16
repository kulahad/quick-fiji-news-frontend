import { fetchSingleFeed, RSS_SOURCES } from "@/lib/rssService";
import { NextResponse } from "next/server";

export async function GET() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for (const source of RSS_SOURCES) {
          const items = await fetchSingleFeed(source);
          const chunk = encoder.encode(JSON.stringify({ items }) + "\n");
          controller.enqueue(chunk);
        }
      } catch (error) {
        controller.error(error);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
