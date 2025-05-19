import { NewsCategory } from "@/types/news";

interface CategoryRule {
  keywords: string[];
  weight: number;
  requireMultipleMatches?: boolean;
  excludeIfContains?: string[];
  contextPatterns?: RegExp[];
}

export const CATEGORY_RULES: Record<
  Exclude<NewsCategory, "All">,
  CategoryRule
> = {
  Local: {
    keywords: [
      "fiji",
      "suva",
      "nadi",
      "lautoka",
      "labasa",
      "pacific",
      "fijian",
      "police",
      "court",
      "magistrate",
      "crime",
      "arrest",
      "charged",
    ],
    weight: 1,
    contextPatterns: [
      /\b(?:in|at|from|near)\s+(?:fiji|suva|nadi|lautoka|labasa)\b/i,
      /\bfijian?\s+(?:community|government|people|residents|police|court)\b/i,
      /\b(?:charged|arrested|appeared|sentenced)\s+(?:in|at|by)\s+(?:court|police)\b/i,
      /\b(?:drug|murder|robbery|theft|assault)\s+(?:case|charge|incident)\b/i,
    ],
  },
  Politics: {
    keywords: ["parliament", "minister", "government", "policy", "election"],
    weight: 0.8,
    requireMultipleMatches: true,
    contextPatterns: [
      /\b(?:prime minister|attorney general|opposition|parliament)\b/i,
      /\b(?:bill|law|legislation|policy|cabinet)\s+(?:passes|announces|debates|discusses)\b/i,
    ],
  },
  Technology: {
    keywords: [
      "technology",
      "digital",
      "internet",
      "cyber",
      "software",
      "ai",
      "computer",
    ],
    weight: 0.7,
    requireMultipleMatches: true,
    excludeIfContains: [
      "technician",
      "technical foul",
      "police",
      "court",
      "drug",
    ],
    contextPatterns: [
      /\b(?:launch|develop|implement|introduce)\s+(?:technology|system|platform)\b/i,
      /\b(?:digital|tech|online)\s+(?:services|solutions|infrastructure)\b/i,
      /\b(?:artificial intelligence|machine learning|automation|innovation)\b/i,
    ],
  },
  Business: {
    keywords: [
      "business",
      "economy",
      "market",
      "trade",
      "finance",
      "investment",
    ],
    weight: 0.7,
    requireMultipleMatches: true,
    contextPatterns: [
      /\b(?:million|billion)\s+(?:dollars|FJD)\b/i,
      /\b(?:company|business|firm)\s+(?:announces|reports|launches)\b/i,
      /\b(?:market|economic|financial)\s+(?:growth|development|forecast)\b/i,
    ],
  },
  Health: {
    keywords: [
      "health",
      "medical",
      "hospital",
      "disease",
      "healthcare",
      "covid",
    ],
    weight: 0.8,
    contextPatterns: [
      /\b(?:health|medical|hospital)\s+(?:care|services|treatment)\b/i,
      /\b(?:ministry of health|public health|healthcare)\b/i,
    ],
  },
  World: {
    keywords: ["international", "global", "foreign", "overseas", "worldwide"],
    weight: 0.6,
    excludeIfContains: ["local", "fiji", "pacific"],
    contextPatterns: [
      /\b(?:international|global|world)\s+(?:community|market|stage)\b/i,
      /\b(?:foreign|overseas)\s+(?:relations|policy|trade)\b/i,
    ],
  },
  Sports: {
    keywords: ["sports", "rugby", "football", "cricket", "game", "match"],
    weight: 0.9,
    contextPatterns: [
      /\b(?:win|lose|defeat|victory|score)\b/i,
      /\b(?:team|player|coach|tournament|championship)\b/i,
      /\b(?:rugby|football|cricket|athletics)\s+(?:match|game|tournament|team)\b/i,
    ],
  },
};

function getKeywordMatches(text: string, keywords: string[]): number {
  const normalizedText = text.toLowerCase();
  return keywords.reduce(
    (count, keyword) =>
      count + (normalizedText.includes(keyword.toLowerCase()) ? 1 : 0),
    0
  );
}

function getContextMatches(text: string, patterns?: RegExp[]): number {
  if (!patterns) return 0;
  return patterns.reduce(
    (count, pattern) => count + (pattern.test(text) ? 1 : 0),
    0
  );
}

export function categorizeText(title: string, content: string): NewsCategory[] {
  const text = `${title} ${content}`.toLowerCase();
  const scores = new Map<NewsCategory, number>();

  Object.entries(CATEGORY_RULES).forEach(([category, rule]) => {
    const categoryName = category as Exclude<NewsCategory, "All">;

    // Check exclusions first
    if (
      rule.excludeIfContains?.some((term) => text.includes(term.toLowerCase()))
    ) {
      return;
    }

    const keywordMatches = getKeywordMatches(text, rule.keywords);
    const contextMatches = getContextMatches(text, rule.contextPatterns);

    // Skip if we require multiple matches and don't have them
    if (rule.requireMultipleMatches && keywordMatches < 2) {
      return;
    }

    // Calculate score based on matches and weight
    const score = (keywordMatches + contextMatches * 1.5) * rule.weight;
    if (score > 0.5) {
      // Threshold for category inclusion
      scores.set(categoryName, score);
    }
  });

  // If no categories matched, default to Local for Fiji news
  if (scores.size === 0 && text.includes("fiji")) {
    return ["Local"];
  }

  // Sort by score and take top categories
  return Array.from(scores.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([category]) => category);
}
