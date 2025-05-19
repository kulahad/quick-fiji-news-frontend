import { useState, useEffect, useCallback, useRef } from "react";
import { NewsItem } from "@/types/news";

export function useNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [loadedSources, setLoadedSources] = useState<Set<string>>(new Set());
  const previousSourcesRef = useRef<Set<string>>(new Set());

  const fetchNews = useCallback(
    async (signal?: AbortSignal) => {
      if (retrying) return;

      try {
        setLoading(true);
        // Don't clear news immediately to prevent flicker
        const prevNews = news;
        const prevSources = new Set(loadedSources);
        previousSourcesRef.current = prevSources;

        const response = await fetch("/api/news-stream", {
          signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No reader available");
        }

        let newNews: NewsItem[] = [];
        let newLoadedSources = new Set<string>();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          // Convert the chunk to text
          const text = new TextDecoder().decode(value);
          const lines = text.split("\n").filter(Boolean);

          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              if (data.type === "chunk" && data.items?.length > 0) {
                newNews.push(...data.items);
                newLoadedSources.add(data.source);
              }
            } catch (e) {
              console.error("Error parsing news chunk:", e);
            }
          }
        }

        setNews(newNews);
        setLoadedSources(newLoadedSources);
        setError(null);
      } catch (err) {
        console.error("Error fetching news:", err);
        if (err instanceof Error) {
          if (err.name === "SyntaxError") {
            setError(
              "Unable to process the news feed data. Our team has been notified."
            );
          } else if (err.name === "TypeError") {
            setError(
              "Unable to connect to the news service. Please check your internet connection."
            );
          } else {
            setError(
              "We're having trouble loading the news. Please try again in a few minutes."
            );
          }
        } else {
          setError(
            "Unable to load the news feed. Please try refreshing the page."
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [news, retrying, loadedSources]
  );

  const refetch = useCallback(() => {
    setRetrying(true);
    fetchNews().finally(() => setRetrying(false));
  }, [fetchNews]);

  useEffect(() => {
    const abortController = new AbortController();
    fetchNews(abortController.signal);
    return () => abortController.abort();
  }, [fetchNews]);

  return {
    news,
    loading,
    error,
    refetch,
    loadedSources: Array.from(loadedSources),
    previousLoadedSources: Array.from(previousSourcesRef.current),
  };
}
