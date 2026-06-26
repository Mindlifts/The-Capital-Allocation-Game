import type { Archetype } from "../types";

export const archetypes: Archetype[] = [
  { key: "sleeping-giant", label: "Sleeping Giant", description: "Scale hiding behind neglect.", color: "#8aa4ff" },
  { key: "cash-cow", label: "Cash Cow", description: "Boring, profitable, difficult to kill.", color: "#71d7a0" },
  { key: "future-takeover", label: "Future Takeover", description: "Strategic enough to attract a larger hunter.", color: "#c591ff" },
  { key: "lottery-ticket", label: "Lottery Ticket", description: "A glorious range of possible outcomes.", color: "#ff9e64" },
  { key: "zombie-miner", label: "Zombie Miner", description: "Still alive. Technically.", color: "#91a0a8" },
  { key: "infrastructure-winner", label: "Infrastructure Winner", description: "The road arrives and changes the map.", color: "#5dd5dc" },
  { key: "mine-builder-mafia", label: "Builder Guild", description: "Operators who have done this before.", color: "#f2c96d" },
  { key: "hidden-royalty", label: "Hidden Royalty", description: "Quiet claims on someone else's success.", color: "#e783b7" },
  { key: "platform-monolith", label: "Platform Monolith", description: "A network that gets harder to dislodge with scale.", color: "#7dd3fc" },
  { key: "frontier-lab", label: "Frontier Lab", description: "Breakthrough science wearing fragile funding.", color: "#d8b4fe" },
  { key: "logistics-spider", label: "Logistics Spider", description: "Connects things others cannot afford to connect.", color: "#f9a8d4" },
  { key: "yield-machine", label: "Yield Machine", description: "Turns mundane assets into repeated output.", color: "#86efac" },
  { key: "patent-fortress", label: "Patent Fortress", description: "Defensible knowledge with cliffs around it.", color: "#93c5fd" },
  { key: "policy-lever", label: "Policy Lever", description: "Wins when rules, subsidies, or mandates shift.", color: "#fde68a" },
  { key: "turnaround-vessel", label: "Turnaround Vessel", description: "A troubled ship with a credible repair crew.", color: "#c4b5fd" },
  { key: "scarcity-broker", label: "Scarcity Broker", description: "Profits from bottlenecks and shortages.", color: "#fb7185" },
  { key: "data-oracle", label: "Data Oracle", description: "Sees patterns before customers know what to ask.", color: "#67e8f9" },
  { key: "craft-compounder", label: "Craft Compounder", description: "Small advantages polished until they gleam.", color: "#bbf7d0" },
  { key: "toll-gate", label: "Toll Gate", description: "Owns the passage everyone else needs.", color: "#fcd34d" },
  { key: "missionary-founder", label: "Missionary Founder", description: "Belief and execution fused into one dangerous person.", color: "#f0abfc" },
  { key: "rollup-engine", label: "Rollup Engine", description: "Buys fragments and tries to make a machine.", color: "#a7f3d0" },
  { key: "deep-value-relic", label: "Deep Value Relic", description: "Dusty assets, real optionality, questionable clock.", color: "#bfdbfe" },
  { key: "brand-cult", label: "Brand Cult", description: "Customers bring identity, not just revenue.", color: "#fda4af" },
  { key: "regulated-fortress", label: "Regulated Fortress", description: "Slow to enter, slower to disrupt.", color: "#99f6e4" },
  { key: "climate-adapter", label: "Climate Adapter", description: "Wins when old systems meet new weather.", color: "#bef264" },
  { key: "automation-forge", label: "Automation Forge", description: "Replaces toil with machines and arguments.", color: "#cbd5e1" },
  { key: "biologic-wildcard", label: "Biologic Wildcard", description: "Nature may approve, reject, or mutate the thesis.", color: "#d9f99d" },
  { key: "merchant-prince", label: "Merchant Prince", description: "Survives by buying well and selling better.", color: "#fdba74" },
  { key: "edge-infrastructure", label: "Edge Infrastructure", description: "Small nodes, big networks, awkward terrain.", color: "#a5b4fc" },
  { key: "forgotten-champion", label: "Forgotten Champion", description: "Former glory with one last chance to matter.", color: "#ddd6fe" },
];

export const archetypeMap = Object.fromEntries(
  archetypes.map((archetype) => [archetype.key, archetype]),
) as Record<string, Archetype>;
