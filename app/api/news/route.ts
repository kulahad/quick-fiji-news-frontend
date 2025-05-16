import { NextResponse } from "next/server";
import { fetchSingleFeed, RSS_SOURCES } from "@/lib/rssService";
import { NewsItem } from "@/types/news";

export async function GET() {
  try {
    const allNews: NewsItem[] = [];

    // Fetch each feed with a timeout
    for (const source of RSS_SOURCES) {
      try {
        const items = await Promise.race([
          fetchSingleFeed(source),
          new Promise<NewsItem[]>((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 10000)
          ),
        ]);
        if (items && Array.isArray(items)) {
          allNews.push(...items);
        }
      } catch (sourceError) {
        console.error(`Error fetching ${source}:`, sourceError);
        // Continue with other sources even if one fails
        continue;
      }
    }

    // If no news items were fetched, throw an error
    if (allNews.length === 0) {
      throw new Error("No news items could be fetched");
    }

    // Sort all news by date
    const sortedNews = allNews.sort(
      (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );

    return NextResponse.json({
      items: sortedNews,
      sourcesCount: RSS_SOURCES.length,
      totalItems: sortedNews.length,
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json(
      { error: "Failed to fetch news. Please try again later." },
      { status: 500 }
    );
  }
}
