import type { Region } from "../types";

export const regions: Region[] = [
  { key: "stable-democracy", label: "Stable Democracy", description: "Slow rules, strong courts, expensive certainty.", stability: 9, traitBias: { politicalRisk: -2, balanceSheet: 1 } },
  { key: "emerging-frontier", label: "Emerging Frontier", description: "Young institutions, large prizes, shifting rules.", stability: 4, traitBias: { politicalRisk: 2, optionality: 1 } },
  { key: "island-nation", label: "Island Nation", description: "Ports matter, weather matters, politics is intimate.", stability: 6, traitBias: { infrastructure: -1, politicalRisk: 1 } },
  { key: "mountain-kingdom", label: "Mountain Kingdom", description: "Altitude, access, and stubborn geology.", stability: 5, traitBias: { infrastructure: -2, geologicalLuck: 1 } },
  { key: "arctic-province", label: "Arctic Province", description: "Rich ground under hostile logistics.", stability: 7, traitBias: { infrastructure: -2, politicalRisk: 1, optionality: 1 } },
  { key: "river-delta", label: "River Delta", description: "Fertile, crowded, flood-prone, commercially alive.", stability: 6, traitBias: { infrastructure: 1, politicalRisk: 1 } },
  { key: "desert-corridor", label: "Desert Corridor", description: "Solar glare, long roads, and scarce water.", stability: 5, traitBias: { infrastructure: -1, commodityExposure: 1 } },
  { key: "trade-city", label: "Trade City", description: "Capital, ports, talent, and brutal competition.", stability: 8, traitBias: { managementQuality: 1, marketHype: 1 } },
  { key: "post-industrial-belt", label: "Post-Industrial Belt", description: "Old assets looking for a second life.", stability: 7, traitBias: { balanceSheet: 1, marketHype: -1 } },
  { key: "rainforest-state", label: "Rainforest State", description: "Biodiversity, permits, and moral complexity.", stability: 4, traitBias: { politicalRisk: 2, geologicalLuck: 1 } },
  { key: "federated-union", label: "Federated Union", description: "Many governments, many vetoes, deep markets.", stability: 8, traitBias: { politicalRisk: -1, executionSkill: 1 } },
  { key: "special-economic-zone", label: "Special Economic Zone", description: "Fast approvals, fragile assumptions.", stability: 6, traitBias: { marketHype: 1, politicalRisk: 1, executionSkill: 1 } },
  { key: "coastal-republic", label: "Coastal Republic", description: "Shipping, finance, storms, and ambition.", stability: 7, traitBias: { infrastructure: 1, commodityExposure: 1 } },
  { key: "inland-commons", label: "Inland Commons", description: "Quiet populations, cheap land, limited glamour.", stability: 8, traitBias: { marketHype: -1, balanceSheet: 1 } },
  { key: "contested-borderland", label: "Contested Borderland", description: "Strategic assets under geopolitical shadow.", stability: 3, traitBias: { politicalRisk: 3, optionality: 1 } },
];

export const regionMap = Object.fromEntries(
  regions.map((region) => [region.key, region]),
) as Record<string, Region>;
