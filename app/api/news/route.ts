import { NextResponse } from "next/server";
import { fetchSingleFeed, RSS_SOURCES } from "@/lib/rssService";
import { NewsItem } from "@/types/news";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 300; // Revalidate every 5 minutes

export async function GET() {
  try {
    const allNews: NewsItem[] = [];
    const sourcePromises = RSS_SOURCES.map((source) =>
      fetchSingleFeed(source).catch((error) => {
        console.error(`Error fetching ${source}:`, error);
        return []; // Return empty array on error
      })
    );

    // Fetch all sources in parallel with a timeout
    const results = await Promise.all(sourcePromises);

    // Combine all results
    results.forEach((items) => {
      if (items && Array.isArray(items)) {
        allNews.push(...items);
      }
    });

    // If no news items were fetched, throw an error
    if (allNews.length === 0) {
      throw new Error("No news items could be fetched");
    }

    // Sort all news by date
    const sortedNews = allNews.sort(
      (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );
    return new NextResponse(
      JSON.stringify({
        items: sortedNews,
        sourcesCount: RSS_SOURCES.length,
        totalItems: sortedNews.length,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json(
      { error: "Failed to fetch news. Please try again later." },
      { status: 500 }
    );
  }
}
