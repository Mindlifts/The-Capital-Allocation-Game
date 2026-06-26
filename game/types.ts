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

export type PhilosophyIdentityKey =
  | "builder"
  | "contrarian"
  | "empire-builder"
  | "momentum-trader"
  | "optionality-hunter"
  | "macro-thinker"
  | "compounder";

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
  role: string;
  desire: string;
  flaw: string;
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
  hiddenTraitOrder: TraitKey[];
  history: number[];
  momentum: number;
  lastChangeReason: string;
  recentChange: number;
  convictionTurns: number;
  protectedThisTurn: boolean;
  asymmetricBet: boolean;
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

export type TurnPhase =
  | "observe"
  | "think"
  | "choose"
  | "commit"
  | "world"
  | "reflect"
  | "ended";

export type PlayerActionType =
  | "investigate"
  | "credibility"
  | "patience"
  | "optionality"
  | "hold";

export interface PlayerAction {
  type: PlayerActionType;
  companyId?: string;
  title: string;
  description: string;
  turn: number;
}

export interface BehaviorStats {
  investigations: number;
  hypeBuys: number;
  valueBuys: number;
  builderBuys: number;
  trims: number;
  panicSells: number;
  holds: number;
  optionalityBets: number;
  credibilityPlays: number;
  patiencePlays: number;
}

export interface InvestmentRecord {
  companyId: string;
  costBasis: number;
  realizedValue: number;
}

export interface PhilosophyIdentity {
  key: PhilosophyIdentityKey;
  name: string;
  description: string;
  score: number;
}

export interface PhilosophyProgression {
  primary: PhilosophyIdentity;
  runnerUp: PhilosophyIdentity;
  identities: PhilosophyIdentity[];
  strengths: string[];
  weaknesses: string[];
  evolution: string;
}

export interface GameState {
  phase: TurnPhase;
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
  lastAction: PlayerAction | null;
  actionUsed: boolean;
  allocationChanged: boolean;
  turnStartValue: number;
  behavior: BehaviorStats;
  decisions: PlayerAction[];
  runId: number;
  legacyScore: number;
  wisdomScore: number;
  seed: number;
}

export interface Mover {
  companyId: string;
  name: string;
  ticker: string;
  changePercent: number;
}

export interface ResolvedEvent {
  event: GameEvent;
  targetIds: string[];
  impactLines: string[];
  mechanicalEffect: string;
  portfolioBefore: number;
  portfolioAfter: number;
  portfolioChange: number;
  wisdomChange: number;
  bestMover: Mover;
  worstMover: Mover;
  lessonHint: string;
  philosophyEffect: string;
}

export interface GameSummary {
  finalValue: number;
  returnPercent: number;
  legacyScore: number;
  wisdomScore: number;
  philosophyProgression: PhilosophyProgression;
  bestInvestment: string;
  worstInvestment: string;
  bestDecision: string;
  worstDecision: string;
  dominantBehavior: string;
  investorArchetype: string;
  lesson: string;
}
