import { useState, useEffect, useCallback, useRef } from "react";
import { NewsItem } from "@/types/news";

export function useNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [loadedSources, setLoadedSources] = useState<Set<string>>(new Set());
  const previousSourcesRef = useRef<Set<string>>(new Set());

  const isValidNewsResponse = (
    data: any
  ): data is {
    type: string;
    items?: NewsItem[];
    source?: string;
  } => {
    return (
      typeof data === "object" &&
      data !== null &&
      typeof data.type === "string" &&
      (data.type === "start" ||
        (data.type === "chunk" &&
          Array.isArray(data.items) &&
          typeof data.source === "string"))
    );
  };

  const fetchNews = useCallback(
    async (signal?: AbortSignal) => {
      if (retrying) return;

      try {
        setLoading(true);
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
        let buffer = ""; // Buffer for incomplete chunks

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          // Convert the chunk to text and add to buffer
          const text = new TextDecoder().decode(value);
          buffer += text;

          // Split by newlines and process complete lines
          const lines = buffer.split("\n");
          // Keep the last incomplete line in the buffer
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim()) continue;

            try {
              const data = JSON.parse(line);

              if (!isValidNewsResponse(data)) {
                console.warn("Invalid news response format:", data);
                continue;
              }

              if (data.type === "chunk" && Array.isArray(data.items)) {
                const validItems = data.items.filter(
                  (item) =>
                    item &&
                    typeof item.title === "string" &&
                    typeof item.source === "string" &&
                    typeof item.pubDate === "string"
                );

                newNews.push(...validItems);
                if (data.source) {
                  newLoadedSources.add(data.source);
                }
              }
            } catch (e) {
              console.debug("Error parsing news chunk:", e);
              // Continue processing other chunks
              continue;
            }
          }
        }

        // Sort news by date before setting state
        const sortedNews = newNews.sort(
          (a, b) =>
            new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
        );

        setNews(sortedNews);
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
    [retrying, loadedSources]
  );

  const refetch = useCallback(() => {
    setRetrying(true);
    fetchNews().finally(() => setRetrying(false));
  }, [fetchNews]);

  useEffect(() => {
    const abortController = new AbortController();
    fetchNews(abortController.signal);
    return () => abortController.abort();
  }, []);

  return {
    news,
    loading,
    error,
    refetch,
    loadedSources: Array.from(loadedSources),
    previousLoadedSources: Array.from(previousSourcesRef.current),
  };
}
