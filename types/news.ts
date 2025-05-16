export type NewsCategory =
  | "Local"
  | "Technology"
  | "Business"
  | "Health"
  | "World"
  | "Sports"
  | "All";

export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  source: string;
  guid: string;
  categories: NewsCategory[];
}

export interface FeedResponse {
  items: NewsItem[];
  error?: string;
}
