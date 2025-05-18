import { useState, useEffect } from "react";
import { NewsItem } from "@/types/news";

export function useNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [loadedSources, setLoadedSources] = useState<Set<string>>(new Set());

  const fetchNews = async (signal?: AbortSignal) => {
    if (retrying) return;

    try {
      setNews([]); // Reset news state
      setLoading(true);
      setLoadedSources(new Set());

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

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        // Convert the chunk to text
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split("\n").filter(Boolean);

        for (const line of lines) {
          const data = JSON.parse(line);

          switch (data.type) {
            case "start":
              break;

            case "chunk":
              setNews((current) => {
                const newNews = [...current, ...data.items];
                // Sort by date
                return newNews.sort(
                  (a, b) =>
                    new Date(b.pubDate).getTime() -
                    new Date(a.pubDate).getTime()
                );
              });
              setLoadedSources((current) => new Set([...current, data.source]));
              break;

            case "error":
              console.error(`Error loading ${data.source}:`, data.error);
              break;

            case "end":
              setLoading(false);
              break;
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      } // Convert technical errors to user-friendly messages
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
    const abortController = new AbortController();
    fetchNews(abortController.signal);

    return () => {
      abortController.abort();
    };
  }, []);

  return {
    news,
    loading,
    error,
    refetch,
    loadedSources: Array.from(loadedSources),
  };
}
