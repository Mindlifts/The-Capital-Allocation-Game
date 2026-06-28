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

export interface CompanyRelationshipSeed {
  companyId: string;
  relationship: string;
  tension: string;
}

export interface NarrativeStakeholder {
  name: string;
  role: "supplier" | "regulator" | "customer" | "founder" | "community" | "government";
  leverage: string;
  tension: string;
}

export type CompanyPersonalityArchetype =
  | "visionary" | "survivor" | "empire" | "pirate" | "bureaucrat"
  | "inventor" | "speculator" | "family-business" | "fallen-giant" | "rebel"
  | "cult-company" | "silent-compounder" | "monopoly" | "explorer" | "gambler"
  | "perfectionist" | "opportunist" | "missionary" | "engineer" | "story-stock";

export type StoryArcCategory =
  | "growth" | "crisis" | "leadership" | "technology" | "competition"
  | "macro" | "reputation" | "unexpected" | "opportunity";

export interface NarrativeVariableRule {
  id: string;
  variable: string;
  condition: string;
  consequence: string;
  affectedRelationships: string[];
}

export interface CompanyNarrativeTrigger {
  id: string;
  when: string;
  storyBeat: string;
  tags: string[];
}

export interface CompanyNarrativeArc {
  id: string;
  title: string;
  premise: string;
  triggerTags: string[];
  beats: string[];
  unresolvedQuestion: string;
}

export interface CompanyEnding {
  id: string;
  title: string;
  legend: string;
  condition: string;
}

export interface CompanyNarrative {
  frameworkVersion: 2;
  identity: string;
  personalityArchetype: CompanyPersonalityArchetype;
  belief: string;
  coreDesire: string;
  greatestStrength: string;
  fatalFlaw: string;
  companyCulture: string;
  investorExcitement: string;
  investorHesitation: string;
  biggestCatalyst: string;
  biggestUnknown: string;
  hiddenTruth: string;
  secretOpportunity: string;
  secretWeakness: string;
  moralDilemma: string;
  longTermAmbition: string;
  fear: string;
  founderStory: string;
  currentChapter: string;
  futurePossibilities: string[];
  rivals: CompanyRelationshipSeed[];
  allies: CompanyRelationshipSeed[];
  stakeholders: NarrativeStakeholder[];
  relationshipHooks: string[];
  narrativeVariables: NarrativeVariableRule[];
  macroTriggers: CompanyNarrativeTrigger[];
  crisisArcs: CompanyNarrativeArc[];
  comebackArcs: CompanyNarrativeArc[];
  legendaryEndings: CompanyEnding[];
  hiddenEndings: CompanyEnding[];
  eventTriggers: CompanyNarrativeTrigger[];
  arcCategories: Partial<Record<StoryArcCategory, CompanyNarrativeArc[]>>;
}

export interface CompanyConfig {
  id: string;
  name: string;
  ticker: string;
  tagline: string;
  logoStyle: string;
  headquarters: string;
  role: string;
  desire: string;
  flaw: string;
  story: string;
  decisionQuestion: string;
  narrative: CompanyNarrative;
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

export interface EventKnowledge {
  summary: string;
  cause: string;
  consequence: string;
  decisionPrompt: string;
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

export type DopamineMomentKind =
  | "combo"
  | "legendary"
  | "near-miss"
  | "critical"
  | "rare-event"
  | "opportunity"
  | "risk-reward"
  | "discovery"
  | "perfect-timing"
  | "unlock";

export interface DopamineMoment {
  kind: DopamineMomentKind;
  title: string;
  body: string;
  tone: "positive" | "negative" | "neutral";
}

export type TurnPhase =
  | "route"
  | "draft"
  | "opportunity"
  | "reason"
  | "observe"
  | "think"
  | "choose"
  | "commit"
  | "world"
  | "reflect"
  | "ended";

export type RouteKind = "safe" | "research" | "crisis" | "rare" | "influence" | "unknown";

export interface RouteScenario {
  id: string;
  title: string;
  subtitle: string;
  lore: string;
  tradeoff: string;
  kind: RouteKind;
  icon: string;
  eventTone?: GameEvent["tone"];
  eventTarget?: GameEvent["targets"];
  resourceDelta: Partial<Resources>;
  wisdomDelta: number;
  legacyDelta: number;
}

export interface RouteRecord {
  turn: number;
  routeId: string;
  title: string;
  consequence: string;
}

export interface PhilosophyUnlock {
  identity: PhilosophyIdentityKey;
  level: number;
  title: string;
  description: string;
  nextAt: number | null;
}

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

export type OpportunityActionType =
  | "invest"
  | "ignore"
  | "research"
  | "watchlist"
  | "hold"
  | "trim"
  | "sell";

export interface CompanyDecisionSnapshot {
  price: number;
  archetype: ArchetypeKey;
  industry: IndustryThemeKey;
  region: RegionKey;
  hype: number;
  risk: string;
  visibleTraits: Array<{ key: TraitKey; label: string; value: number }>;
  hiddenTraitCount: number;
  positionValue: number;
  takeaway: string;
}

export interface InvestmentMemo {
  id: string;
  turn: number;
  opportunityIndex: number;
  companyId: string;
  companyName: string;
  action: OpportunityActionType;
  reason: string;
  snapshot: CompanyDecisionSnapshot;
  result?: {
    priceAfter: number;
    valueAfter: number;
    changePercent: number;
    note: string;
  };
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
  moments: DopamineMoment[];
  currentEvent: ResolvedEvent | null;
  routeChoices: RouteScenario[];
  activeRoute: RouteScenario | null;
  routeHistory: RouteRecord[];
  roundOpportunityIds: string[];
  opportunityIndex: number;
  pendingOpportunityAction: OpportunityActionType | null;
  decisionMemos: InvestmentMemo[];
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
  hiddenModifiers: {
    institutionalTrust: number;
  };
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
  moments: DopamineMoment[];
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
  mostCommonReason: string;
  bestMemo: string;
  worstMemo: string;
}
