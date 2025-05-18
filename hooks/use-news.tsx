import { useState, useEffect } from "react";
import { NewsItem, FeedResponse } from "@/types/news";

export function useNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  const fetchNews = async (signal?: AbortSignal) => {
    if (retrying) return;
    try {
      const response = await fetch("/api/news", {
        signal,
        cache: "no-store",
        next: { revalidate: 0 },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: FeedResponse = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      // Sort news by date
      const sortedItems = [...(data.items || [])].sort(
        (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
      );

      // Show first batch immediately
      setNews(sortedItems.slice(0, 5));
      setLoading(false);

      // Show rest in batches with small delays
      const batchSize = 5;
      for (let i = batchSize; i <= sortedItems.length; i += batchSize) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setNews(sortedItems.slice(0, i));
      }

      // Set final batch if not perfectly divisible
      if (sortedItems.length % batchSize !== 0) {
        setNews(sortedItems);
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch news. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    setRetrying(true);
    try {
      await fetchNews();
    } finally {
      setRetrying(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const abortController = new AbortController();

    fetchNews(abortController.signal);

    return () => {
      mounted = false;
      abortController.abort();
    };
  }, []);

  return { news, loading, error, refetch };
}
