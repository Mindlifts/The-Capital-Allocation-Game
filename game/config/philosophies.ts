import type { Philosophy } from "../types";

export const philosophies: Philosophy[] = [
  {
    key: "deep-value", name: "Deep Value Hunter", subtitle: "Buy what the crowd abandoned.",
    doctrine: "Power: find strength where attention has gone cold. Failure mode: mistaking neglect for hidden greatness.",
    icon: "◇", resources: { capital: 1000, attention: 6, credibility: 5, patience: 8, optionality: 4 },
    preferredArchetypes: ["sleeping-giant", "zombie-miner"], scoringBonus: "+Wisdom for committing to neglected resilience; -Wisdom for chasing hype.", accent: "#8aa4ff",
  },
  {
    key: "builder-believer", name: "Mine Builder Believer", subtitle: "Back the people who can ship.",
    doctrine: "Power: trust operators who can turn chaos into finished things. Failure mode: loyalty after evidence breaks.",
    icon: "△", resources: { capital: 950, attention: 6, credibility: 7, patience: 9, optionality: 4 },
    preferredArchetypes: ["mine-builder-mafia", "infrastructure-winner"], scoringBonus: "+Wisdom for holding proven execution through noise.", accent: "#f2c96d",
  },
  {
    key: "momentum-speculator", name: "Momentum Speculator", subtitle: "Narrative is a force. Respect it.",
    doctrine: "Power: ride belief while it is becoming contagious. Failure mode: arriving after the story becomes gravity.",
    icon: "↗", resources: { capital: 1100, attention: 8, credibility: 4, patience: 4, optionality: 7 },
    preferredArchetypes: ["lottery-ticket", "future-takeover"], scoringBonus: "+Wisdom for fast adaptation; -Wisdom for late hype.", accent: "#ff9e64",
  },
  {
    key: "cash-flow-collector", name: "Cash Flow Collector", subtitle: "Let the assets pay you to wait.",
    doctrine: "Power: choose durable engines over drama. Failure mode: safety so complete it misses transformation.",
    icon: "▤", resources: { capital: 1050, attention: 5, credibility: 7, patience: 7, optionality: 3 },
    preferredArchetypes: ["cash-cow", "hidden-royalty"], scoringBonus: "+Wisdom for resilience; lower volatility, lower explosive upside.", accent: "#71d7a0",
  },
];

export const philosophyMap = Object.fromEntries(
  philosophies.map((philosophy) => [philosophy.key, philosophy]),
) as Record<Philosophy["key"], Philosophy>;
