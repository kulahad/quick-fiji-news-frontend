"use client"
import Image from "next/image"
import { Clock, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

// Mock data for news articles
const mockNewsData = {
  all: [
    {
      id: 1,
      title: "SpaceX Successfully Launches Starship for Orbital Test Flight",
      summary:
        "SpaceX's Starship rocket completed its first successful orbital test flight, marking a significant milestone for space exploration.",
      source: "Space News",
      sourceIcon: "SN",
      category: "technology",
      publishedAt: "2 hours ago",
      imageUrl: "/placeholder.svg?height=200&width=300",
      likes: 245,
      comments: 89,
    },
    {
      id: 2,
      title: "Global Markets React to New Economic Policies",
      summary:
        "Stock markets worldwide showed mixed reactions as new economic policies were announced by major economies.",
      source: "Financial Times",
      sourceIcon: "FT",
      category: "business",
      publishedAt: "4 hours ago",
      imageUrl: "/placeholder.svg?height=200&width=300",
      likes: 132,
      comments: 47,
    },
    {
      id: 3,
      title: "Breakthrough in Renewable Energy Storage Technology",
      summary:
        "Scientists have developed a new battery technology that could revolutionize how renewable energy is stored and distributed.",
      source: "Science Daily",
      sourceIcon: "SD",
      category: "science",
      publishedAt: "6 hours ago",
      imageUrl: "/placeholder.svg?height=200&width=300",
      likes: 312,
      comments: 78,
    },
    {
      id: 4,
      title: "New Study Reveals Benefits of Mediterranean Diet",
      summary:
        "A comprehensive study confirms that following a Mediterranean diet can significantly reduce the risk of heart disease and improve longevity.",
      source: "Health Journal",
      sourceIcon: "HJ",
      category: "health",
      publishedAt: "8 hours ago",
      imageUrl: "/placeholder.svg?height=200&width=300",
      likes: 189,
      comments: 42,
    },
    {
      id: 5,
      title: "Tech Giants Announce Collaboration on AI Ethics Standards",
      summary:
        "Major technology companies have formed an alliance to develop and implement ethical standards for artificial intelligence development.",
      source: "Tech Insider",
      sourceIcon: "TI",
      category: "technology",
      publishedAt: "10 hours ago",
      imageUrl: "/placeholder.svg?height=200&width=300",
      likes: 276,
      comments: 93,
    },
  ],
  technology: [
    {
      id: 1,
      title: "SpaceX Successfully Launches Starship for Orbital Test Flight",
      summary:
        "SpaceX's Starship rocket completed its first successful orbital test flight, marking a significant milestone for space exploration.",
      source: "Space News",
      sourceIcon: "SN",
      category: "technology",
      publishedAt: "2 hours ago",
      imageUrl: "/placeholder.svg?height=200&width=300",
      likes: 245,
      comments: 89,
    },
    {
      id: 5,
      title: "Tech Giants Announce Collaboration on AI Ethics Standards",
      summary:
        "Major technology companies have formed an alliance to develop and implement ethical standards for artificial intelligence development.",
      source: "Tech Insider",
      sourceIcon: "TI",
      category: "technology",
      publishedAt: "10 hours ago",
      imageUrl: "/placeholder.svg?height=200&width=300",
      likes: 276,
      comments: 93,
    },
    {
      id: 6,
      title: "New Smartphone Features Advanced Camera Technology",
      summary:
        "The latest flagship smartphone release boasts revolutionary camera technology that rivals professional photography equipment.",
      source: "Gadget Review",
      sourceIcon: "GR",
      category: "technology",
      publishedAt: "12 hours ago",
      imageUrl: "/placeholder.svg?height=200&width=300",
      likes: 198,
      comments: 65,
    },
  ],
  business: [
    {
      id: 2,
      title: "Global Markets React to New Economic Policies",
      summary:
        "Stock markets worldwide showed mixed reactions as new economic policies were announced by major economies.",
      source: "Financial Times",
      sourceIcon: "FT",
      category: "business",
      publishedAt: "4 hours ago",
      imageUrl: "/placeholder.svg?height=200&width=300",
      likes: 132,
      comments: 47,
    },
    {
      id: 7,
      title: "E-commerce Giant Expands into New Markets",
      summary:
        "One of the world's largest e-commerce companies announced plans to expand operations into previously untapped markets.",
      source: "Business Weekly",
      sourceIcon: "BW",
      category: "business",
      publishedAt: "14 hours ago",
      imageUrl: "/placeholder.svg?height=200&width=300",
      likes: 154,
      comments: 38,
    },
  ],
  science: [
    {
      id: 3,
      title: "Breakthrough in Renewable Energy Storage Technology",
      summary:
        "Scientists have developed a new battery technology that could revolutionize how renewable energy is stored and distributed.",
      source: "Science Daily",
      sourceIcon: "SD",
      category: "science",
      publishedAt: "6 hours ago",
      imageUrl: "/placeholder.svg?height=200&width=300",
      likes: 312,
      comments: 78,
    },
    {
      id: 8,
      title: "New Species Discovered in Deep Ocean Exploration",
      summary:
        "Marine biologists have identified several previously unknown species during a deep-sea exploration mission.",
      source: "Nature Journal",
      sourceIcon: "NJ",
      category: "science",
      publishedAt: "16 hours ago",
      imageUrl: "/placeholder.svg?height=200&width=300",
      likes: 231,
      comments: 57,
    },
  ],
  health: [
    {
      id: 4,
      title: "New Study Reveals Benefits of Mediterranean Diet",
      summary:
        "A comprehensive study confirms that following a Mediterranean diet can significantly reduce the risk of heart disease and improve longevity.",
      source: "Health Journal",
      sourceIcon: "HJ",
      category: "health",
      publishedAt: "8 hours ago",
      imageUrl: "/placeholder.svg?height=200&width=300",
      likes: 189,
      comments: 42,
    },
    {
      id: 9,
      title: "Mental Health Awareness Campaign Launches Globally",
      summary:
        "A new initiative aims to reduce stigma around mental health issues and improve access to support services worldwide.",
      source: "Wellness Today",
      sourceIcon: "WT",
      category: "health",
      publishedAt: "18 hours ago",
      imageUrl: "/placeholder.svg?height=200&width=300",
      likes: 267,
      comments: 83,
    },
  ],
}

export default function NewsFeed({ category = "all" }: { category?: string }) {
  const newsArticles = mockNewsData[category as keyof typeof mockNewsData] || mockNewsData.all

  return (
    <div className="newspaper-column">
      {newsArticles.map((article, index) => (
        <article key={article.id} className="mb-8 break-inside-avoid">
          <div className="mb-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <div className="uppercase font-semibold">{article.category}</div>
              <div className="flex items-center text-muted-foreground">
                <Clock className="mr-1 h-3 w-3" />
                <span>{article.publishedAt}</span>
              </div>
            </div>
            <h3 className="font-heading text-xl md:text-2xl leading-tight mb-2">{article.title}</h3>
            <div className="relative h-48 w-full mb-3">
              <Image src={article.imageUrl || "/placeholder.svg"} alt={article.title} fill className="object-cover" />
            </div>
            <p className="first-letter text-base leading-relaxed mb-3">{article.summary}</p>
            <div className="flex justify-between items-center text-xs">
              <span className="italic">By {article.source} Correspondent</span>
              <Button variant="link" size="sm" className="flex items-center h-auto p-0">
                <span className="underline">Continue reading</span>
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
          {index < newsArticles.length - 1 && <Separator className="newspaper-divider" />}
        </article>
      ))}
    </div>
  )
}

