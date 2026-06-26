import type { IndustryTheme } from "../types";

export const industries: IndustryTheme[] = [
  { key: "mining", label: "Mining", description: "Rocks, roads, permits, and uncomfortable timelines.", volatilityBias: 0.04, traitBias: { geologicalLuck: 1, commodityExposure: 1, infrastructure: -1 } },
  { key: "energy", label: "Energy", description: "Cycles, security, grids, and political heat.", volatilityBias: 0.03, traitBias: { commodityExposure: 2, politicalRisk: 1 } },
  { key: "technology", label: "Technology", description: "Fast narratives, scale dreams, and product cliffs.", volatilityBias: 0.05, traitBias: { marketHype: 1, optionality: 1, executionSkill: 1 } },
  { key: "agriculture", label: "Agriculture", description: "Weather, yield, logistics, and patient compounding.", volatilityBias: 0.01, traitBias: { infrastructure: 1, commodityExposure: 1 } },
  { key: "shipping", label: "Shipping", description: "Rates, ports, leverage, and global bottlenecks.", volatilityBias: 0.04, traitBias: { commodityExposure: 1, balanceSheet: -1 } },
  { key: "biotech", label: "Biotech", description: "Binary evidence, long waits, and fragile hope.", volatilityBias: 0.08, traitBias: { optionality: 2, geologicalLuck: 1, balanceSheet: -1 } },
  { key: "infrastructure", label: "Infrastructure", description: "Slow assets that reshape the map.", volatilityBias: -0.01, traitBias: { infrastructure: 2, politicalRisk: 1 } },
  { key: "water", label: "Water", description: "Scarcity, pipes, rights, and unglamorous necessity.", volatilityBias: 0.01, traitBias: { infrastructure: 1, balanceSheet: 1 } },
  { key: "space", label: "Space", description: "Huge dreams above thin cash oxygen.", volatilityBias: 0.08, traitBias: { optionality: 2, marketHype: 2, balanceSheet: -2 } },
  { key: "defense", label: "Defense", description: "Procurement cycles and strategic indispensability.", volatilityBias: 0.02, traitBias: { politicalRisk: 1, balanceSheet: 1, executionSkill: 1 } },
  { key: "education", label: "Education", description: "Trust, distribution, and slow behavior change.", volatilityBias: 0, traitBias: { managementQuality: 1, marketHype: -1 } },
  { key: "healthcare", label: "Healthcare", description: "Regulation, demand, and messy incentives.", volatilityBias: 0.02, traitBias: { balanceSheet: 1, politicalRisk: 1 } },
  { key: "fintech", label: "Fintech", description: "Trust engines built on rules and speed.", volatilityBias: 0.05, traitBias: { marketHype: 1, executionSkill: 1, politicalRisk: 1 } },
  { key: "media", label: "Media", description: "Attention, taste, and unstable empires.", volatilityBias: 0.04, traitBias: { marketHype: 2, managementQuality: 1 } },
  { key: "real-assets", label: "Real Assets", description: "Land, leases, inflation, and patience.", volatilityBias: 0, traitBias: { balanceSheet: 1, infrastructure: 1 } },
  { key: "robotics", label: "Robotics", description: "Automation promises meeting factory reality.", volatilityBias: 0.05, traitBias: { executionSkill: 2, optionality: 1 } },
  { key: "cybersecurity", label: "Cybersecurity", description: "Invisible risk with urgent buyers.", volatilityBias: 0.03, traitBias: { marketHype: 1, executionSkill: 1 } },
  { key: "tourism", label: "Tourism", description: "Desire, cycles, weather, and national mood.", volatilityBias: 0.03, traitBias: { politicalRisk: 1, infrastructure: 1 } },
  { key: "recycling", label: "Recycling", description: "Waste streams trying to become supply chains.", volatilityBias: 0.04, traitBias: { infrastructure: 1, optionality: 1 } },
  { key: "food-systems", label: "Food Systems", description: "Brands, logistics, biology, and margins.", volatilityBias: 0.02, traitBias: { managementQuality: 1, commodityExposure: 1 } },
];

export const industryMap = Object.fromEntries(
  industries.map((industry) => [industry.key, industry]),
) as Record<string, IndustryTheme>;
