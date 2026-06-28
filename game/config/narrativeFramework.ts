import type { CompanyNarrative, CompanyPersonalityArchetype, StoryArcCategory } from "../types";

export const STORY_ARC_CATEGORIES: Record<StoryArcCategory, string> = {
  growth: "Expansion creates a new strength and a new vulnerability.",
  crisis: "Pressure reveals what the company actually values.",
  leadership: "Authority, succession, ego, or culture changes the outcome.",
  technology: "A technical possibility succeeds, fails, or changes the business model.",
  competition: "A rival’s action forces adaptation rather than a passive price change.",
  macro: "A world-scale shift interacts with this company’s specific character.",
  reputation: "Past behavior changes what customers, institutions, and players believe.",
  unexpected: "A coherent surprise emerges from a hidden truth or relationship.",
  opportunity: "A door opens, but entering it sacrifices something meaningful.",
};

export const PERSONALITY_ARCHETYPES: Record<CompanyPersonalityArchetype, { desire: string; shadow: string }> = {
  visionary: { desire: "Make others inhabit a future only it can currently see.", shadow: "Treat dissent as a failure of imagination." },
  survivor: { desire: "Remain alive long enough to become relevant again.", shadow: "Mistake continued existence for progress." },
  empire: { desire: "Control the system around its original business.", shadow: "Expand until complexity becomes the enemy." },
  pirate: { desire: "Exploit rules slower institutions are afraid to challenge.", shadow: "Discover that trust was an asset too." },
  bureaucrat: { desire: "Turn process and permission into durable advantage.", shadow: "Protect the process after it stops serving the mission." },
  inventor: { desire: "Prove the impossible mechanism actually works.", shadow: "Assume a working invention automatically becomes a working company." },
  speculator: { desire: "Reach the possibility before evidence makes it expensive.", shadow: "Fall in love with possibility itself." },
  "family-business": { desire: "Protect a legacy across generations.", shadow: "Confuse bloodline with competence." },
  "fallen-giant": { desire: "Become worthy of its old reputation again.", shadow: "Rebuild the past instead of meeting the future." },
  rebel: { desire: "Defeat an industry it believes has become complacent.", shadow: "Define itself entirely through opposition." },
  "cult-company": { desire: "Turn customers and employees into believers.", shadow: "Make loyalty hostile to evidence." },
  "silent-compounder": { desire: "Accumulate strength without requiring attention.", shadow: "Let discipline become complacency." },
  monopoly: { desire: "Become the unavoidable layer everyone else must use.", shadow: "Forget how to deserve its power." },
  explorer: { desire: "Find what the settled world overlooked.", shadow: "Need the search more than the answer." },
  gambler: { desire: "Win an outcome large enough to erase every prior mistake.", shadow: "Treat survival as unused upside." },
  perfectionist: { desire: "Build something failure cannot embarrass.", shadow: "Arrive after the opportunity has passed." },
  opportunist: { desire: "Move wherever mispricing and disorder create leverage.", shadow: "Have no identity when easy opportunities disappear." },
  missionary: { desire: "Make the world adopt a belief it considers necessary.", shadow: "Interpret resistance as moral weakness." },
  engineer: { desire: "Solve the physical bottleneck everyone else narrates around.", shadow: "Underestimate people, politics, and timing." },
  "story-stock": { desire: "Become the future its valuation already assumes.", shadow: "Spend belief faster than it creates proof." },
};

export const NARRATIVE_CONTENT_RULES = [
  "The company must contain an internal contradiction.",
  "Its greatest strength must be capable of becoming a weakness.",
  "At least one relationship must create mutual dependence, not decoration.",
  "Every catalyst must create a new tradeoff rather than free upside.",
  "Every crisis must test identity, culture, leadership, or trust—not merely reduce value.",
  "A hidden ending must require a coherent combination of behavior and discovery.",
  "Reject generic finance language, empty buzzwords, and interchangeable technology claims.",
  "The player must immediately want to know what happens next.",
] as const;

export interface NarrativeQualityResult { valid: boolean; failures: string[] }

export function validateNarrativeQuality(narrative: CompanyNarrative): NarrativeQualityResult {
  const failures: string[] = [];
  if (!narrative.belief || !narrative.fear || !narrative.hiddenTruth) failures.push("Missing belief, fear, or hidden truth.");
  if (!narrative.rivals.length || !narrative.allies.length) failures.push("The company is not connected to the ecosystem.");
  if (narrative.futurePossibilities.length < 3) failures.push("Fewer than three genuinely different futures.");
  if (narrative.narrativeVariables.length < 2) failures.push("Narrative does not react to enough world variables.");
  if (!narrative.legendaryEndings.length || !narrative.hiddenEndings.length) failures.push("Missing legendary or hidden ending.");
  const generic = /ai-powered|revolutionary platform|industry-leading solution|synergy-driven/i;
  if (generic.test(JSON.stringify(narrative))) failures.push("Contains rejected generic language.");
  return { valid: failures.length === 0, failures };
}

export const GENERATOR_BLUEPRINT = {
  minimumPersonalityArchetypes: 20,
  minimumIndustries: 25,
  minimumRegions: 15,
  minimumCentralConflicts: 50,
  minimumCatalysts: 100,
  minimumCrises: 80,
  minimumComebacks: 80,
  minimumRelationshipHooks: 100,
  rule: "Never assemble companies randomly. Personality, motivation, relationships, variables, and arcs must form one coherent protagonist.",
} as const;
