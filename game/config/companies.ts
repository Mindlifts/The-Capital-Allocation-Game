import type { CompanyConfig } from "../types";

export const companies: CompanyConfig[] = [
  {
    id: "aurora-metals", name: "Aurora Metals", ticker: "AURM", commodity: "Gold", archetype: "mine-builder-mafia",
    tagline: "Old hands, new district, very expensive promises.", basePrice: 24, volatility: 0.16,
    role: "Veteran Builder", desire: "Wants to prove the old team still has one great build left.", flaw: "Can confuse experience with inevitability.",
    traits: { builderDna: 9, geologicalLuck: 7, balanceSheet: 6, managementQuality: 8, infrastructure: 5, politicalRisk: 4, marketHype: 6, commodityExposure: 8, optionality: 7, executionSkill: 9 },
    initiallyVisible: ["builderDna", "managementQuality", "marketHype", "politicalRisk"],
  },
  {
    id: "ironwood-resources", name: "Ironwood Resources", ticker: "IRWD", commodity: "Iron", archetype: "cash-cow",
    tagline: "Unfashionable ore. Unfashionably strong cash flow.", basePrice: 18, volatility: 0.09,
    role: "Quiet Provider", desire: "Wants patience to notice boring durability.", flaw: "Rarely gives the player a heroic story.",
    traits: { builderDna: 6, geologicalLuck: 6, balanceSheet: 9, managementQuality: 7, infrastructure: 8, politicalRisk: 3, marketHype: 2, commodityExposure: 7, optionality: 3, executionSkill: 8 },
    initiallyVisible: ["balanceSheet", "infrastructure", "marketHype", "commodityExposure"],
  },
  {
    id: "silver-mammoth", name: "Silver Mammoth", ticker: "MAMT", commodity: "Silver", archetype: "lottery-ticket",
    tagline: "A colossal target beneath a very small treasury.", basePrice: 7, volatility: 0.28,
    role: "Glittering Question Mark", desire: "Wants someone to believe before proof arrives.", flaw: "Burns attention and capital at the same temperature.",
    traits: { builderDna: 3, geologicalLuck: 9, balanceSheet: 2, managementQuality: 5, infrastructure: 3, politicalRisk: 6, marketHype: 9, commodityExposure: 9, optionality: 10, executionSkill: 3 },
    initiallyVisible: ["geologicalLuck", "balanceSheet", "marketHype", "optionality"],
  },
  {
    id: "borealis-energy", name: "Borealis Energy", ticker: "BORE", commodity: "Uranium", archetype: "sleeping-giant",
    tagline: "A stranded asset waiting for the cycle to remember it.", basePrice: 14, volatility: 0.19,
    role: "Sleeping Colossus", desire: "Wants the world to need what it already has.", flaw: "May stay early longer than the player stays brave.",
    traits: { builderDna: 5, geologicalLuck: 8, balanceSheet: 6, managementQuality: 6, infrastructure: 4, politicalRisk: 5, marketHype: 4, commodityExposure: 10, optionality: 8, executionSkill: 5 },
    initiallyVisible: ["geologicalLuck", "balanceSheet", "commodityExposure", "politicalRisk"],
  },
  {
    id: "terranova-copper", name: "TerraNova Copper", ticker: "TNVC", commodity: "Copper", archetype: "future-takeover",
    tagline: "Too strategic to ignore, too early to trust.", basePrice: 21, volatility: 0.18,
    role: "Strategic Prize", desire: "Wants to become too useful for the world to ignore.", flaw: "Attracts rumors before it earns trust.",
    traits: { builderDna: 7, geologicalLuck: 8, balanceSheet: 5, managementQuality: 7, infrastructure: 6, politicalRisk: 4, marketHype: 7, commodityExposure: 9, optionality: 9, executionSkill: 6 },
    initiallyVisible: ["geologicalLuck", "managementQuality", "commodityExposure", "marketHype"],
  },
  {
    id: "emberrock-mining", name: "EmberRock Mining", ticker: "EMBR", commodity: "Nickel", archetype: "zombie-miner",
    tagline: "A turnaround, according to the seventh turnaround deck.", basePrice: 5, volatility: 0.23,
    role: "Charming Survivor", desire: "Wants one more chance, and then one more after that.", flaw: "Confuses survival with progress.",
    traits: { builderDna: 3, geologicalLuck: 4, balanceSheet: 1, managementQuality: 3, infrastructure: 6, politicalRisk: 5, marketHype: 7, commodityExposure: 6, optionality: 5, executionSkill: 2 },
    initiallyVisible: ["balanceSheet", "infrastructure", "marketHype", "politicalRisk"],
  },
  {
    id: "bluepeak-minerals", name: "BluePeak Minerals", ticker: "BLUE", commodity: "Copper", archetype: "infrastructure-winner",
    tagline: "One transmission line away from becoming investable.", basePrice: 13, volatility: 0.15,
    role: "Map Changer", desire: "Wants one road, one line, one practical unlock.", flaw: "Its fate depends on pieces it does not control.",
    traits: { builderDna: 6, geologicalLuck: 7, balanceSheet: 6, managementQuality: 7, infrastructure: 9, politicalRisk: 3, marketHype: 3, commodityExposure: 8, optionality: 6, executionSkill: 7 },
    initiallyVisible: ["infrastructure", "managementQuality", "politicalRisk", "balanceSheet"],
  },
  {
    id: "helio-rare-earths", name: "Helio Rare Earths", ticker: "HLIO", commodity: "Rare Earths", archetype: "hidden-royalty",
    tagline: "A peculiar license with more leverage than it appears.", basePrice: 16, volatility: 0.14,
    role: "Hidden Lever", desire: "Wants the patient player to notice indirect power.", flaw: "Looks smaller than the optionality it controls.",
    traits: { builderDna: 4, geologicalLuck: 6, balanceSheet: 8, managementQuality: 8, infrastructure: 5, politicalRisk: 4, marketHype: 5, commodityExposure: 7, optionality: 9, executionSkill: 7 },
    initiallyVisible: ["balanceSheet", "managementQuality", "optionality", "marketHype"],
  },
];
