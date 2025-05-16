import Parser from "rss-parser";
import { NewsItem, NewsCategory } from "@/types/news";
import { formatVolumeInfo } from "./textUtils";

const parser = new Parser();

// Category keywords for classification
const CATEGORY_KEYWORDS = {
  Local: ["fiji", "suva", "nadi", "local", "community", "pacific"],
  Technology: ["technology", "digital", "internet", "cyber", "tech", "online"],
  Business: ["business", "economy", "market", "trade", "finance", "company"],
  Health: ["health", "medical", "hospital", "disease", "healthcare", "covid"],
  World: ["world", "international", "global", "foreign", "overseas"],
  Sports: ["sports", "rugby", "football", "cricket", "athletics", "olympics"],
};

export const RSS_SOURCES = [
  "https://www.fbcnews.com.fj/feed/",
  "https://fijisun.com.fj/feed/",
  "https://islandsbusiness.com/feed/",
  "https://fijilive.com/feed/",
  "https://fijionenews.com.fj/feed/",
  "https://www.fijitimes.com.fj/feed/",
];

function categorizeNews(title: string, content: string): NewsCategory[] {
  const categories = new Set<NewsCategory>();
  const textToCheck = `${title} ${content}`.toLowerCase();

  Object.entries(CATEGORY_KEYWORDS).forEach(([category, keywords]) => {
    if (
      keywords.some((keyword) => textToCheck.includes(keyword.toLowerCase()))
    ) {
      categories.add(category as NewsCategory);
    }
  });

  // Always ensure at least one category
  if (categories.size === 0) {
    categories.add("Local");
  }

  return Array.from(categories);
}

export async function fetchSingleFeed(source: string): Promise<NewsItem[]> {
  try {
    const response = await fetch(source);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const feedContent = await response.text();
    const feed = await parser.parseString(feedContent);

    return feed.items.map((item) => {
      const content = item.content || item["content:encoded"] || "";
      const title = item.title || "";
      const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();

      // Calculate days elapsed in the current month
      const startOfMonth = new Date(
        pubDate.getFullYear(),
        pubDate.getMonth(),
        1
      );
      const daysDiff = Math.floor(
        (pubDate.getTime() - startOfMonth.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Generate volume info based on publication date
      // Volume is the year-month combination, Issue is the week number within that month
      const volumeInfo = {
        number: `${pubDate.getFullYear()}-${(pubDate.getMonth() + 1)
          .toString()
          .padStart(2, "0")}`,
        issue: `${Math.floor(daysDiff / 7) + 1}`,
      };

      return {
        title: title,
        link: item.link || "",
        pubDate: pubDate.toISOString(),
        content: content,
        source: new URL(source).hostname,
        guid: item.guid || `${source}-${title}`,
        categories: categorizeNews(title, content),
        volume: volumeInfo,
      };
    });
  } catch (error) {
    console.error(`Error fetching ${source}:`, error);
    return [];
  }
}

export async function* fetchFeedsGenerator() {
  for (const source of RSS_SOURCES) {
    const items = await fetchSingleFeed(source);
    yield items;
  }
}
