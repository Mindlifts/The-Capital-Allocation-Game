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

export type ArchetypeKey = string;
export type IndustryThemeKey = string;
export type RegionKey = string;

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

export type InvestorCardRarity = "Common" | "Rare" | "Epic" | "Legendary";

export type InvestorCardEffect =
  | "builder"
  | "contrarian"
  | "empire"
  | "momentum"
  | "compounder"
  | "risk"
  | "story"
  | "allocator"
  | "macro"
  | "optionality"
  | "discovery";

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

export interface IndustryTheme {
  key: IndustryThemeKey;
  label: string;
  description: string;
  volatilityBias: number;
  traitBias: Partial<Record<TraitKey, number>>;
}

export interface Region {
  key: RegionKey;
  label: string;
  description: string;
  stability: number;
  traitBias: Partial<Record<TraitKey, number>>;
}

export interface OpportunityCard {
  id: string;
  title: string;
  industry?: IndustryThemeKey;
  region?: RegionKey;
  lore: string;
  upside: string;
  risk: string;
  traitBias: Partial<Record<TraitKey, number>>;
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
  industry: IndustryThemeKey;
  region: RegionKey;
  commodity: string;
  basePrice: number;
  volatility: number;
  traits: CompanyTraits;
  initiallyVisible: TraitKey[];
}

export interface CompanyState extends CompanyConfig {
  opportunity: OpportunityCard;
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

export interface InvestorCard {
  id: string;
  title: string;
  shortLore: string;
  passiveAbility: string;
  drawback: string;
  synergies: string[];
  rarity: InvestorCardRarity;
  icon: string;
  effect: InvestorCardEffect;
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
  targets: "one" | "all" | "commodity" | "archetype" | "industry" | "region";
  commodity?: string;
  archetype?: ArchetypeKey;
  industry?: IndustryThemeKey;
  region?: RegionKey;
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
  | "draft"
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
  investorDeck: InvestorCard[];
  draftOffer: InvestorCard[];
  draftedCardIds: string[];
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
