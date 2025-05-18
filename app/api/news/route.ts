import { NextResponse } from "next/server";
import { fetchSingleFeed, RSS_SOURCES } from "@/lib/rssService";
import { NewsItem } from "@/types/news";

// Use dynamic rendering but with caching
export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 minutes

export async function GET() {
  try {
    const allNews: NewsItem[] = [];

    // Create an array of promises for parallel fetching
    const fetchPromises = RSS_SOURCES.map((source) =>
      fetchSingleFeed(source).catch((error) => {
        console.error(`Error fetching ${source}:`, error);
        return []; // Return empty array on error
      })
    );

    // Wait for all fetches to complete
    const results = await Promise.all(fetchPromises);

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

    // Return response with caching headers
    return new NextResponse(
      JSON.stringify({
        items: sortedNews,
        sourcesCount: RSS_SOURCES.length,
        totalItems: sortedNews.length,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
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
