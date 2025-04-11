"use client"

import { useState } from "react"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function NewsFilters() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search articles..."
            className="pl-8 border-black dark:border-gray-800"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <Separator className="bg-black/20 dark:bg-white/20" />
      <Accordion type="multiple" defaultValue={["sources", "categories", "date"]}>
        <AccordionItem value="sources" className="border-b-0">
          <AccordionTrigger className="font-heading py-2 hover:no-underline">Sources</AccordionTrigger>
          <AccordionContent className="pt-1 pb-2">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch id="source-all" defaultChecked />
                <Label htmlFor="source-all">All Sources</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="source-tech-insider" />
                <Label htmlFor="source-tech-insider">Tech Insider</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="source-financial-times" />
                <Label htmlFor="source-financial-times">Financial Times</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="source-science-daily" />
                <Label htmlFor="source-science-daily">Science Daily</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="source-health-journal" />
                <Label htmlFor="source-health-journal">Health Journal</Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="categories" className="border-b-0">
          <AccordionTrigger className="font-heading py-2 hover:no-underline">Categories</AccordionTrigger>
          <AccordionContent className="pt-1 pb-2">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch id="category-all" defaultChecked />
                <Label htmlFor="category-all">All Categories</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="category-technology" />
                <Label htmlFor="category-technology">Technology</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="category-business" />
                <Label htmlFor="category-business">Business</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="category-science" />
                <Label htmlFor="category-science">Science</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="category-health" />
                <Label htmlFor="category-health">Health</Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="date" className="border-b-0">
          <AccordionTrigger className="font-heading py-2 hover:no-underline">Date</AccordionTrigger>
          <AccordionContent className="pt-1 pb-2">
            <div className="space-y-4">
              <Select defaultValue="today">
                <SelectTrigger className="border-black dark:border-gray-800">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="this-year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <Separator className="bg-black/20 dark:bg-white/20" />
      <Button className="w-full font-heading">Apply Filters</Button>
    </div>
  )
}

