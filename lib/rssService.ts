import { NewsItem, NewsCategory } from "@/types/news";
import fetch from "node-fetch";
import { XMLParser } from "fast-xml-parser";

interface RSSItem {
  title?: string;
  link?: string;
  pubDate?: string;
  description?: string;
  content?: string;
  "content:encoded"?: string;
  guid?: string;
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "_",
  textNodeName: "text",
  isArray: (name) => ["item", "entry"].includes(name),
});

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
  "https://fbcnews.com.fj/feed/",
  "https://fijisun.com.fj/feed/",
  "https://islandsbusiness.com/feed/",
  "https://fijilive.com/feed/",
  "https://fijionenews.com.fj/feed/",
  "https://fijitimes.com.fj/feed/",
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(source, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; QuickFijiNews/1.0)",
        Accept: "application/xml, text/xml, application/rss+xml",
        "Cache-Control": "no-cache",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const feedContent = await response.text();
    const result = parser.parse(feedContent);

    // Handle both RSS and Atom feeds
    const channel = result.rss?.channel || result.feed;
    const items = channel?.item || channel?.entry || [];

    return items.map((item: RSSItem) => {
      const content =
        item.content || item["content:encoded"] || item.description || "";
      const title = item.title || "";
      const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();

      const startOfMonth = new Date(
        pubDate.getFullYear(),
        pubDate.getMonth(),
        1
      );
      const daysDiff = Math.floor(
        (pubDate.getTime() - startOfMonth.getTime()) / (1000 * 60 * 60 * 24)
      );

      const volumeInfo = {
        number: `${pubDate.getFullYear()}-${(pubDate.getMonth() + 1)
          .toString()
          .padStart(2, "0")}`,
        issue: `${Math.floor(daysDiff / 7) + 1}`,
      };

      return {
        title,
        link: item.link || "",
        pubDate: pubDate.toISOString(),
        content,
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
