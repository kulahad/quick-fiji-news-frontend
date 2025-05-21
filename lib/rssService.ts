import { NewsItem, NewsCategory } from "@/types/news";
import fetch from "node-fetch";
import { XMLParser } from "fast-xml-parser";
import { categorizeText } from "./categoryMatcher";

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

export const RSS_SOURCES = [
  "https://fbcnews.com.fj/feed/",
  "https://fijisun.com.fj/feed/",
  "https://islandsbusiness.com/feed/",
  "https://fijilive.com/feed/",
  "https://fijionenews.com.fj/feed/",
  "https://www.fijitimes.com/feed/", // Added www and using HTTPS
];

function categorizeNews(title: string, content: string): NewsCategory[] {
  return categorizeText(title, content);
}

// Keep track of failed feeds and their retry counts
const failedFeeds = new Map<string, { retries: number; lastAttempt: number }>();
const MAX_RETRIES = 3;
const RETRY_DELAY = 30000; // 30 seconds

export async function fetchSingleFeed(
  source: string,
  retryCount = 0
): Promise<NewsItem[]> {
  // Check if we should retry this feed
  const failedFeed = failedFeeds.get(source);
  if (failedFeed) {
    const timeSinceLastAttempt = Date.now() - failedFeed.lastAttempt;
    if (timeSinceLastAttempt < RETRY_DELAY) {
      console.log(
        `Skipping ${source}, too soon to retry. Wait ${
          (RETRY_DELAY - timeSinceLastAttempt) / 1000
        }s`
      );
      return [];
    }
  }

  try {
    const controller = new AbortController();
    // Longer timeout for Fiji Times due to slower response times
    const timeout = source.includes("fijitimes.com.fj") ? 30000 : 10000;
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(source, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
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
      }; // Set time to start of day to remove time component
      const dateOnly = new Date(
        pubDate.getFullYear(),
        pubDate.getMonth(),
        pubDate.getDate()
      );
      return {
        title,
        link: item.link || "",
        pubDate: pubDate.toISOString(),
        content,
        source: new URL(source).hostname.replace(/^www\./, ""),
        guid: item.guid || `${source}-${title}`,
        categories: categorizeNews(title, content),
        volume: volumeInfo,
      };
    });
  } catch (error) {
    console.error(`Error fetching ${source}:`, error);

    // Handle retry logic
    const currentFailedFeed = failedFeeds.get(source) || {
      retries: 0,
      lastAttempt: 0,
    };

    if (currentFailedFeed.retries < MAX_RETRIES) {
      failedFeeds.set(source, {
        retries: currentFailedFeed.retries + 1,
        lastAttempt: Date.now(),
      });

      // Schedule a retry
      setTimeout(async () => {
        console.log(
          `Retrying ${source}, attempt ${currentFailedFeed.retries + 1}`
        );
        const retryResult = await fetchSingleFeed(
          source,
          currentFailedFeed.retries + 1
        );
        if (retryResult.length > 0) {
          // Successfully retrieved data, remove from failed feeds
          failedFeeds.delete(source);
        }
      }, RETRY_DELAY);
    } else {
      console.error(`Max retries reached for ${source}`);
      failedFeeds.delete(source); // Reset retry count after max retries
    }

    return [];
  }
}

export async function* fetchFeedsGenerator() {
  for (const source of RSS_SOURCES) {
    const items = await fetchSingleFeed(source);
    yield items;
  }
}
