import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import NewsFeed from "@/components/news-feed";
import { NewsFilters } from "@/components/news-filters";

export default function Home() {
  // Get current date in newspaper format
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const formattedDate = today.toLocaleDateString("en-FJ", options);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-black dark:border-gray-800">
        <div className="container px-4 md:px-6 lg:px-8 py-6">
          <div className="flex justify-end mb-2">
            <ThemeToggle />
          </div>
          <div className="text-center mb-4">
            <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl tracking-tighter">
              Quick Fiji News
            </h1>
            <div className="text-xs uppercase tracking-widest mt-1">
              {formattedDate}
            </div>
          </div>
          <div className="flex justify-between items-center text-sm border-t border-b border-black dark:border-gray-800 py-2">
            <div>Vol. XXIV No. 1,842</div>
            <div>Fiji's Premier News Aggregator</div>
            <div>Daily Edition</div>
          </div>
        </div>
      </header>
      <main className="container px-4 md:px-6 lg:px-8 py-8 grid grid-cols-1 gap-8 md:grid-cols-[220px_1fr]">
        <aside className="hidden md:block">
          <div className="sticky top-20">
            <div className="font-heading text-xl mb-4 pb-2 border-b-2 border-black dark:border-gray-800">
              Sections
            </div>
            <NewsFilters />
          </div>
        </aside>
        <div className="space-y-6">
          <div className="border-b-2 border-black dark:border-gray-800 pb-2">
            <h2 className="font-heading text-3xl">Top Stories</h2>
          </div>
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="bg-transparent h-auto p-0 mb-4 flex-wrap">
              <TabsTrigger
                value="all"
                className="font-heading text-base data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:shadow-none rounded-none"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="technology"
                className="font-heading text-base data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:shadow-none rounded-none"
              >
                Technology
              </TabsTrigger>
              <TabsTrigger
                value="business"
                className="font-heading text-base data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:shadow-none rounded-none"
              >
                Business
              </TabsTrigger>
              <TabsTrigger
                value="science"
                className="font-heading text-base data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:shadow-none rounded-none"
              >
                Science
              </TabsTrigger>
              <TabsTrigger
                value="health"
                className="font-heading text-base data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:shadow-none rounded-none"
              >
                Health
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <Suspense fallback={<NewsFeedSkeleton />}>
                <NewsFeed category="all" />
              </Suspense>
            </TabsContent>
            <TabsContent value="technology">
              <Suspense fallback={<NewsFeedSkeleton />}>
                <NewsFeed category="technology" />
              </Suspense>
            </TabsContent>
            <TabsContent value="business">
              <Suspense fallback={<NewsFeedSkeleton />}>
                <NewsFeed category="business" />
              </Suspense>
            </TabsContent>
            <TabsContent value="science">
              <Suspense fallback={<NewsFeedSkeleton />}>
                <NewsFeed category="science" />
              </Suspense>
            </TabsContent>
            <TabsContent value="health">
              <Suspense fallback={<NewsFeedSkeleton />}>
                <NewsFeed category="health" />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <footer className="border-t border-black dark:border-gray-800 py-6 mt-8">
        <div className="container px-4 md:px-6 lg:px-8 text-center text-sm">
          <p>© {today.getFullYear()} Quick Fiji News. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function NewsFeedSkeleton() {
  return (
    <div className="space-y-4">
      {Array(5)
        .fill(null)
        .map((_, i) => (
          <div key={i} className="flex flex-col space-y-3">
            <div className="flex items-start space-x-4">
              <Skeleton className="h-12 w-12 rounded-md" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}
