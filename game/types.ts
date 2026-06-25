export type TraitKey =
  | "builderDna"
  | "geologicalLuck"
  | "balanceSheet"
  | "managementQuality"
  | "infrastructure"
  | "politicalRisk"
  | "marketHype"
  | "commodityExposure"
  | "optionality"
  | "executionSkill";

export type ArchetypeKey =
  | "sleeping-giant"
  | "cash-cow"
  | "future-takeover"
  | "lottery-ticket"
  | "zombie-miner"
  | "infrastructure-winner"
  | "mine-builder-mafia"
  | "hidden-royalty";

export type PhilosophyKey =
  | "deep-value"
  | "builder-believer"
  | "momentum-speculator"
  | "cash-flow-collector";

export type ResourceKey =
  | "capital"
  | "attention"
  | "credibility"
  | "patience"
  | "optionality";

export type Resources = Record<ResourceKey, number>;
export type CompanyTraits = Record<TraitKey, number>;

export interface TraitDefinition {
  key: TraitKey;
  label: string;
  shortLabel: string;
  description: string;
  positive: boolean;
}

export interface Archetype {
  key: ArchetypeKey;
  label: string;
  description: string;
  color: string;
}

export interface CompanyConfig {
  id: string;
  name: string;
  ticker: string;
  tagline: string;
  archetype: ArchetypeKey;
  commodity: string;
  basePrice: number;
  volatility: number;
  traits: CompanyTraits;
  initiallyVisible: TraitKey[];
}

export interface CompanyState extends CompanyConfig {
  price: number;
  previousPrice: number;
  revealedTraits: TraitKey[];
  history: number[];
  momentum: number;
  lastChangeReason: string;
}

export interface Philosophy {
  key: PhilosophyKey;
  name: string;
  subtitle: string;
  doctrine: string;
  icon: string;
  resources: Resources;
  preferredArchetypes: ArchetypeKey[];
  scoringBonus: string;
  accent: string;
}

export interface EventEffect {
  trait?: TraitKey;
  traitDelta?: number;
  priceDelta?: number;
  resource?: Exclude<ResourceKey, "capital">;
  resourceDelta?: number;
}

export interface GameEvent {
  id: string;
  title: string;
  kicker: string;
  description: string;
  tone: "positive" | "negative" | "mixed";
  targets: "one" | "all" | "commodity" | "archetype";
  commodity?: string;
  archetype?: ArchetypeKey;
  effects: EventEffect[];
  narrative: string;
}

export interface PortfolioPosition {
  companyId: string;
  shares: number;
  averageCost: number;
  invested: number;
}

export interface TurnLog {
  id: string;
  turn: number;
  title: string;
  body: string;
  tone: "positive" | "negative" | "neutral";
}

export interface InvestmentRecord {
  companyId: string;
  costBasis: number;
  realizedValue: number;
}

export interface GameState {
  phase: "playing" | "event" | "ended";
  turn: number;
  maxTurns: number;
  philosophy: PhilosophyKey;
  resources: Resources;
  initialCapital: number;
  companies: CompanyState[];
  portfolio: PortfolioPosition[];
  records: InvestmentRecord[];
  logs: TurnLog[];
  currentEvent: ResolvedEvent | null;
  legacyScore: number;
  seed: number;
}

export interface ResolvedEvent {
  event: GameEvent;
  targetIds: string[];
  impactLines: string[];
}

export interface GameSummary {
  finalValue: number;
  returnPercent: number;
  legacyScore: number;
  bestInvestment: string;
  worstInvestment: string;
  style: string;
  lesson: string;
}
