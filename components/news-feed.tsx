"use client";
import Image from "next/image";
import { Clock, ExternalLink, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNews } from "@/hooks/use-news";
import { stripHtml, truncateText } from "@/lib/textUtils";
import { NewsCategory } from "@/types/news";

function isWithinDate(pubDate: string, dateFilter: string): boolean {
  const now = new Date();
  const date = new Date(pubDate);
  switch (dateFilter) {
    case "today":
      return date.toDateString() === now.toDateString();
    case "this-week": {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return date >= weekAgo && date <= now;
    }
    case "this-month": {
      return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth()
      );
    }
    case "this-year":
      return date.getFullYear() === now.getFullYear();
    default:
      return true;
  }
}

interface NewsFeedProps {
  sources: string[];
  categories: NewsCategory[];
  dateFilter: string;
  searchQuery: string;
}

export default function NewsFeed({
  sources,
  categories,
  dateFilter,
  searchQuery,
}: NewsFeedProps) {
  const { news, loading, error } = useNews();

  const filteredNews = news.filter((item) => {
    const matchesSource = sources.length === 0 || sources.includes(item.source);
    const matchesCategory =
      categories.length === 0 ||
      (item.categories &&
        item.categories.some((cat) => categories.includes(cat)));
    const matchesDate = isWithinDate(item.pubDate, dateFilter);
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSource && matchesCategory && matchesDate && matchesSearch;
  });

  // Show error as a banner instead of full screen
  const errorBanner = error && (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6">
      Error loading news: {error}
    </div>
  );

  return (
    <div className="space-y-8">
      {errorBanner}
      {loading && news.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Loading news...</p>
        </div>
      ) : (
        <>
          {filteredNews.length === 0 && (
            <div className="text-center text-gray-500">
              No news found for the selected filters.
            </div>
          )}
          {filteredNews.map((item) => (
            <article key={item.guid} className="flex flex-col space-y-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight hover:text-blue-600">
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    {item.title}
                  </a>
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <time>{new Date(item.pubDate).toLocaleDateString()}</time>
                  <Separator orientation="vertical" className="h-4" />
                  <span>{item.source}</span>
                  {item.categories?.length > 0 && (
                    <>
                      <Separator orientation="vertical" className="h-4" />
                      <span>{item.categories.join(", ")}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-gray-700 leading-relaxed">
                {truncateText(stripHtml(item.content), 300)}
              </div>
              <div>
                <Button variant="outline" size="sm" asChild>
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    Read more <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </div>
              <Separator />
            </article>
          ))}{" "}
          {loading && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
