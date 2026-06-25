import type { Philosophy } from "../types";

export const philosophies: Philosophy[] = [
  {
    key: "deep-value", name: "Deep Value Hunter", subtitle: "Buy what the crowd abandoned.",
    doctrine: "You see neglect as a renewable resource—provided the balance sheet survives the wait.",
    icon: "◇", resources: { capital: 1000, attention: 6, credibility: 5, patience: 8, optionality: 4 },
    preferredArchetypes: ["sleeping-giant", "zombie-miner"], scoringBonus: "+Legacy for buying below intrinsic quality.", accent: "#8aa4ff",
  },
  {
    key: "builder-believer", name: "Mine Builder Believer", subtitle: "Back the people who can ship.",
    doctrine: "Slides are cheap. Teams that have built through a cycle are not.",
    icon: "△", resources: { capital: 950, attention: 6, credibility: 7, patience: 9, optionality: 4 },
    preferredArchetypes: ["mine-builder-mafia", "infrastructure-winner"], scoringBonus: "+Legacy for holding execution quality.", accent: "#f2c96d",
  },
  {
    key: "momentum-speculator", name: "Momentum Speculator", subtitle: "Narrative is a force. Respect it.",
    doctrine: "You move quickly, size ruthlessly, and intend to leave before the music notices.",
    icon: "↗", resources: { capital: 1100, attention: 8, credibility: 4, patience: 4, optionality: 7 },
    preferredArchetypes: ["lottery-ticket", "future-takeover"], scoringBonus: "+Legacy for profitable high-hype positions.", accent: "#ff9e64",
  },
  {
    key: "cash-flow-collector", name: "Cash Flow Collector", subtitle: "Let the assets pay you to wait.",
    doctrine: "A quiet compounding machine is still a machine, even when nobody posts about it.",
    icon: "▤", resources: { capital: 1050, attention: 5, credibility: 7, patience: 7, optionality: 3 },
    preferredArchetypes: ["cash-cow", "hidden-royalty"], scoringBonus: "+Legacy for resilient balance sheets.", accent: "#71d7a0",
  },
];

export const philosophyMap = Object.fromEntries(
  philosophies.map((philosophy) => [philosophy.key, philosophy]),
) as Record<Philosophy["key"], Philosophy>;
