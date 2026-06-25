import type { TraitDefinition } from "../types";

export const traits: TraitDefinition[] = [
  { key: "builderDna", label: "Builder DNA", shortLabel: "Builder", description: "The instinct to create durable operating assets.", positive: true },
  { key: "geologicalLuck", label: "Geological Luck", shortLabel: "Geology", description: "What the rock is willing to give up.", positive: true },
  { key: "balanceSheet", label: "Balance Sheet", shortLabel: "Balance", description: "Financial resilience when the cycle turns.", positive: true },
  { key: "managementQuality", label: "Management Quality", shortLabel: "Mgmt", description: "Judgment, alignment, and capital discipline.", positive: true },
  { key: "infrastructure", label: "Infrastructure", shortLabel: "Infra", description: "Roads, power, ports, and practical access.", positive: true },
  { key: "politicalRisk", label: "Political Risk", shortLabel: "Politics", description: "Exposure to unstable jurisdictions and policy shocks.", positive: false },
  { key: "marketHype", label: "Market Hype", shortLabel: "Hype", description: "Narrative energy, useful until it becomes gravity.", positive: false },
  { key: "commodityExposure", label: "Commodity Exposure", shortLabel: "Cycle", description: "Sensitivity to the underlying commodity cycle.", positive: true },
  { key: "optionality", label: "Optionality", shortLabel: "Options", description: "Ways for the story to become much larger.", positive: true },
  { key: "executionSkill", label: "Execution Skill", shortLabel: "Execution", description: "The ability to turn slides into operating reality.", positive: true },
];

export const traitMap = Object.fromEntries(
  traits.map((trait) => [trait.key, trait]),
) as Record<TraitDefinition["key"], TraitDefinition>;
