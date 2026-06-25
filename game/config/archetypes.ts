import type { Archetype } from "../types";

export const archetypes: Archetype[] = [
  { key: "sleeping-giant", label: "Sleeping Giant", description: "Scale hiding behind neglect.", color: "#8aa4ff" },
  { key: "cash-cow", label: "Cash Cow", description: "Boring, profitable, difficult to kill.", color: "#71d7a0" },
  { key: "future-takeover", label: "Future Takeover", description: "Strategic enough to attract a larger hunter.", color: "#c591ff" },
  { key: "lottery-ticket", label: "Lottery Ticket", description: "A glorious range of possible outcomes.", color: "#ff9e64" },
  { key: "zombie-miner", label: "Zombie Miner", description: "Still listed. Technically.", color: "#91a0a8" },
  { key: "infrastructure-winner", label: "Infrastructure Winner", description: "The road arrives and changes the map.", color: "#5dd5dc" },
  { key: "mine-builder-mafia", label: "Mine Builder Mafia", description: "Operators who have done this before.", color: "#f2c96d" },
  { key: "hidden-royalty", label: "Hidden Royalty", description: "Quiet claims on someone else's success.", color: "#e783b7" },
];

export const archetypeMap = Object.fromEntries(
  archetypes.map((archetype) => [archetype.key, archetype]),
) as Record<Archetype["key"], Archetype>;
