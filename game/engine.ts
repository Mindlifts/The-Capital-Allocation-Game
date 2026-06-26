import { companies, events, industryMap, investorCards, opportunities, philosophyMap, regionMap, traitMap } from "./config";
import type {
  BehaviorStats,
  CompanyState,
  DopamineMoment,
  GameEvent,
  GameState,
  GameSummary,
  InvestmentRecord,
  InvestorCard,
  Mover,
  PhilosophyIdentityKey,
  PhilosophyProgression,
  PhilosophyKey,
  PlayerAction,
  PlayerActionType,
  ResolvedEvent,
  TraitKey,
  TurnLog,
} from "./types";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const random = (seed: number) => {
  const nextSeed = (seed * 1664525 + 1013904223) >>> 0;
  return { value: nextSeed / 4294967296, seed: nextSeed };
};

const pick = <T,>(items: T[], seed: number) => {
  const roll = random(seed);
  return { item: items[Math.floor(roll.value * items.length)], seed: roll.seed };
};

const capital = (value: number) =>
  `${Math.round(value).toLocaleString("en-US")} capital`;

const draftTurns = new Set([1, 3, 5, 7, 9]);

const emptyBehavior = (): BehaviorStats => ({
  investigations: 0,
  hypeBuys: 0,
  valueBuys: 0,
  builderBuys: 0,
  trims: 0,
  panicSells: 0,
  holds: 0,
  optionalityBets: 0,
  credibilityPlays: 0,
  patiencePlays: 0,
});

function shuffled<T>(items: T[], seed: number) {
  const result = [...items];
  let nextSeed = seed;
  for (let index = result.length - 1; index > 0; index -= 1) {
    const roll = random(nextSeed);
    nextSeed = roll.seed;
    const swap = Math.floor(roll.value * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return { items: result, seed: nextSeed };
}

function cardWeight(card: InvestorCard) {
  if (card.rarity === "Legendary") return 3;
  if (card.rarity === "Epic") return 7;
  if (card.rarity === "Rare") return 14;
  return 28;
}

function generateDraftOffer(seed: number, draftedIds: string[], count = 3) {
  let nextSeed = seed;
  const offer: InvestorCard[] = [];
  const available = investorCards.filter((card) => !draftedIds.includes(card.id));
  while (offer.length < count && offer.length < available.length) {
    const weighted = available
      .filter((card) => !offer.some((item) => item.id === card.id))
      .flatMap((card) => Array.from({ length: cardWeight(card) }, () => card));
    const picked = pick(weighted, nextSeed);
    nextSeed = picked.seed;
    offer.push(picked.item);
  }
  return { offer, seed: nextSeed };
}

function hasCard(state: GameState, effect: InvestorCard["effect"]) {
  return state.investorDeck.some((card) => card.effect === effect);
}

function moment(kind: DopamineMoment["kind"], title: string, body: string, tone: DopamineMoment["tone"] = "positive"): DopamineMoment {
  return { kind, title, body, tone };
}

function applyTraitBias(
  traits: CompanyState["traits"],
  bias: Partial<Record<TraitKey, number>> | undefined,
) {
  if (!bias) return traits;
  const next = { ...traits };
  (Object.entries(bias) as Array<[TraitKey, number]>).forEach(([key, delta]) => {
    next[key] = clamp(next[key] + delta, 1, 10);
  });
  return next;
}

export function initializeGame(
  philosophy: PhilosophyKey,
  seed = Math.floor(Date.now() % 4294967295),
): GameState {
  const selected = philosophyMap[philosophy];
  let nextSeed = seed;
  const companyStates = companies.map<CompanyState>((company) => {
    const industry = industryMap[company.industry];
    const region = regionMap[company.region];
    const matchingOpportunities = opportunities.filter((opportunity) =>
      opportunity.industry === company.industry || opportunity.region === company.region || (!opportunity.industry && !opportunity.region),
    );
    const opportunityPick = pick(matchingOpportunities.length ? matchingOpportunities : opportunities, nextSeed);
    nextSeed = opportunityPick.seed;
    let traits = { ...company.traits };
    traits = applyTraitBias(traits, industry?.traitBias);
    traits = applyTraitBias(traits, region?.traitBias);
    traits = applyTraitBias(traits, opportunityPick.item.traitBias);
    (Object.keys(traits) as TraitKey[]).forEach((key) => {
      const roll = random(nextSeed);
      nextSeed = roll.seed;
      const variation = roll.value < 0.25 ? -1 : roll.value > 0.75 ? 1 : 0;
      traits[key] = clamp(traits[key] + variation, 1, 10);
    });
    const hiddenOrder = shuffled(
      (Object.keys(traits) as TraitKey[]).filter((key) => !company.initiallyVisible.includes(key)),
      nextSeed,
    );
    nextSeed = hiddenOrder.seed;
    const visible = [...company.initiallyVisible];
    if (hiddenOrder.items.length && company.id.length % 2 === seed % 2) {
      visible.pop();
    }
    return {
      ...company,
      opportunity: opportunityPick.item,
      traits,
      price: company.basePrice,
      previousPrice: company.basePrice,
      revealedTraits: visible,
      hiddenTraitOrder: hiddenOrder.items,
      history: [company.basePrice],
      momentum: 0,
      recentChange: 0,
      convictionTurns: 0,
      protectedThisTurn: false,
      asymmetricBet: false,
      lastChangeReason: `${industry?.label ?? "Unknown Theme"} · ${region?.label ?? "Unknown Region"}`,
    };
  });
  const initialDraft = generateDraftOffer(nextSeed, []);
  nextSeed = initialDraft.seed;

  return {
    phase: "draft",
    turn: 1,
    maxTurns: 10,
    philosophy,
    resources: { ...selected.resources },
    investorDeck: [],
    draftOffer: initialDraft.offer,
    draftedCardIds: [],
    initialCapital: selected.resources.capital,
    companies: companyStates,
    portfolio: [],
    records: companies.map((company) => ({
      companyId: company.id,
      costBasis: 0,
      realizedValue: 0,
    })),
    logs: [{
      id: "opening",
      turn: 1,
      title: `${selected.name} enters the room`,
      body: `${capital(selected.resources.capital)} is ready. Draft your first mental model, then observe the cast and let your philosophy take shape.`,
      tone: "neutral",
    }],
    moments: [moment("unlock", "Mental Model Draft", "Pick a card to start shaping your philosophy before the world tests it.", "neutral")],
    currentEvent: null,
    lastAction: null,
    actionUsed: false,
    allocationChanged: false,
    turnStartValue: selected.resources.capital,
    behavior: emptyBehavior(),
    decisions: [],
    runId: seed,
    legacyScore: 0,
    wisdomScore: 0,
    seed: nextSeed,
  };
}

export function portfolioValue(state: GameState) {
  return state.portfolio.reduce((total, position) => {
    const company = state.companies.find((item) => item.id === position.companyId);
    return total + (company?.price ?? 0) * position.shares;
  }, 0);
}

export function netWorth(state: GameState) {
  return state.resources.capital + portfolioValue(state);
}

export function positionValue(state: GameState, companyId: string) {
  const position = state.portfolio.find((item) => item.companyId === companyId);
  const company = state.companies.find((item) => item.id === companyId);
  return (position?.shares ?? 0) * (company?.price ?? 0);
}

const identityMeta: Record<PhilosophyIdentityKey, { name: string; description: string }> = {
  builder: {
    name: "Builder",
    description: "You trust execution, craft, and the people who can turn uncertainty into finished reality.",
  },
  contrarian: {
    name: "Contrarian",
    description: "You look for neglected strength and prefer being early to being applauded.",
  },
  "empire-builder": {
    name: "Empire Builder",
    description: "You spread influence across a map and build a system instead of one perfect bet.",
  },
  "momentum-trader": {
    name: "Momentum Trader",
    description: "You respect narrative velocity and move when belief itself becomes a force.",
  },
  "optionality-hunter": {
    name: "Optionality Hunter",
    description: "You seek asymmetric doors: situations where one discovery can change the whole run.",
  },
  "macro-thinker": {
    name: "Macro Thinker",
    description: "You read cycles, exposure, infrastructure, and the wider world behind each character.",
  },
  compounder: {
    name: "Compounder",
    description: "You prefer durability, patience, and resilient machines that keep working while drama burns out.",
  },
};

export function inferPhilosophyProgression(state: GameState): PhilosophyProgression {
  const committed = state.portfolio
    .map((position) => {
      const company = state.companies.find((item) => item.id === position.companyId);
      return company ? { company, value: position.shares * company.price } : null;
    })
    .filter((item): item is { company: CompanyState; value: number } => Boolean(item));
  const committedValue = Math.max(1, committed.reduce((total, item) => total + item.value, 0));
  const exposure = (predicate: (company: CompanyState) => boolean) =>
    committed.reduce((total, item) => total + (predicate(item.company) ? item.value : 0), 0) / committedValue;
  const avgTrait = (trait: TraitKey) =>
    committed.reduce((total, item) => total + item.company.traits[trait] * (item.value / committedValue), 0);
  const behavior = state.behavior;
  const concentration = committed.length <= 2 && committedValue > 1 ? 2 : 0;
  const diversification = committed.length >= 4 ? 3 : committed.length >= 3 ? 1 : 0;
  const scores: Record<PhilosophyIdentityKey, number> = {
    builder:
      behavior.builderBuys * 4 +
      behavior.patiencePlays * 2 +
      behavior.holds * 1.5 +
      exposure((company) => company.archetype === "mine-builder-mafia" || company.traits.executionSkill >= 8) * 10,
    contrarian:
      behavior.valueBuys * 4 +
      exposure((company) => company.traits.marketHype <= 4 && company.traits.balanceSheet >= 6) * 12 +
      Math.max(0, 6 - avgTrait("marketHype")) +
      behavior.investigations,
    "empire-builder":
      diversification * 3 +
      behavior.credibilityPlays * 2 +
      exposure((company) => company.archetype === "infrastructure-winner" || company.archetype === "mine-builder-mafia") * 8 +
      committed.length,
    "momentum-trader":
      behavior.hypeBuys * 4 +
      behavior.trims * 1.5 +
      exposure((company) => company.traits.marketHype >= 7 || company.recentChange > 0.08) * 12 -
      behavior.holds,
    "optionality-hunter":
      behavior.optionalityBets * 5 +
      exposure((company) => company.traits.optionality >= 8 || company.archetype === "lottery-ticket" || company.archetype === "future-takeover") * 12 +
      concentration,
    "macro-thinker":
      exposure((company) => company.traits.commodityExposure >= 8 || company.archetype === "sleeping-giant") * 10 +
      exposure((company) => company.traits.infrastructure >= 8 || company.traits.politicalRisk >= 6) * 5 +
      behavior.investigations * 1.2,
    compounder:
      behavior.holds * 3 +
      behavior.patiencePlays * 2 +
      exposure((company) => company.archetype === "cash-cow" || company.archetype === "hidden-royalty" || company.traits.balanceSheet >= 8) * 12 -
      behavior.hypeBuys,
  };
  const identities = (Object.entries(scores) as Array<[PhilosophyIdentityKey, number]>)
    .map(([key, score]) => ({ key, score: Math.max(0, Number(score.toFixed(1))), ...identityMeta[key] }))
    .sort((a, b) => b.score - a.score);
  const primary = identities[0];
  const runnerUp = identities[1] ?? identities[0];
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  if (behavior.investigations >= 2) strengths.push("You paid for information before demanding certainty.");
  if (behavior.holds + behavior.patiencePlays >= 3) strengths.push("You showed patience when uncertainty tried to hurry you.");
  if (behavior.valueBuys >= 2) strengths.push("You noticed neglected strength before it became obvious.");
  if (behavior.builderBuys >= 2) strengths.push("You recognized execution quality and backed builders.");
  if (behavior.optionalityBets >= 2) strengths.push("You understood that some doors are worth more than they look.");
  if (committed.length >= 4) strengths.push("You built a system instead of relying on one perfect call.");
  if (!strengths.length) strengths.push("You preserved flexibility while your philosophy was still forming.");
  if (behavior.hypeBuys > behavior.valueBuys + 1) weaknesses.push("You were vulnerable to charisma and rising attention.");
  if (behavior.panicSells > 0) weaknesses.push("You paid for emotional certainty after volatility had already arrived.");
  if (behavior.optionalityBets >= 3 && state.wisdomScore < 12) weaknesses.push("You reached for asymmetry faster than you built survival.");
  if (behavior.investigations === 0 && state.turn > 3) weaknesses.push("You often committed before reducing the fog.");
  if (committed.length <= 1 && state.turn > 5) weaknesses.push("Your philosophy became fragile because it depended on too few outcomes.");
  if (!weaknesses.length) weaknesses.push("Your main risk was under-defining your edge before the world reacted.");
  const gap = primary.score - runnerUp.score;
  const evolution = primary.score < 5
    ? "Still forming. Your choices have not hardened into a clear doctrine yet."
    : gap < 3
      ? `Hybrid path: ${primary.name} with a visible ${runnerUp.name} undertone.`
      : `Clear drift toward ${primary.name}. Your repeated choices are becoming an identity.`;
  return { primary, runnerUp, identities, strengths: strengths.slice(0, 3), weaknesses: weaknesses.slice(0, 3), evolution };
}

export function nextHiddenTrait(company: CompanyState) {
  return company.hiddenTraitOrder.find(
    (key) => !company.revealedTraits.includes(key),
  );
}

export function investorTakeaway(company: CompanyState) {
  const traits = company.traits;
  if (traits.marketHype >= 8 && traits.balanceSheet <= 4) return "Charismatic, fragile, and dangerous to believe too quickly.";
  if (traits.builderDna >= 8 && traits.executionSkill >= 7) return "This character can turn conviction into reality.";
  if (traits.balanceSheet >= 8 && traits.marketHype <= 4) return "Quiet strength. The crowd may be missing the durable thing.";
  if (traits.optionality >= 8 && traits.geologicalLuck >= 7) return "A doorway to a larger story, with teeth on the hinge.";
  if (traits.politicalRisk >= 7) return "The promise is real; the map is hostile.";
  return "The read depends on what remains hidden.";
}

export function riskLevel(company: CompanyState) {
  const score =
    company.traits.politicalRisk +
    (10 - company.traits.balanceSheet) +
    company.volatility * 20;
  return score >= 18 ? "Extreme" : score >= 13 ? "High" : score >= 9 ? "Medium" : "Low";
}

export function beginAllocation(state: GameState): GameState {
  if (state.phase !== "observe") return state;
  return { ...state, phase: "think" };
}

export function draftInvestorCard(state: GameState, cardId: string): GameState {
  if (state.phase !== "draft") return state;
  const card = state.draftOffer.find((item) => item.id === cardId);
  if (!card) return state;
  const resources = { ...state.resources };
  let wisdomGain = 1;
  let legacyGain = 0;
  if (card.effect === "discovery") resources.attention = clamp(resources.attention + 1, 0, 10);
  if (card.effect === "risk") resources.patience = clamp(resources.patience + 1, 0, 10);
  if (card.effect === "optionality") resources.optionality = clamp(resources.optionality + 1, 0, 10);
  if (card.effect === "allocator") resources.capital += 50;
  if (card.effect === "empire") legacyGain = 1;
  if (card.rarity === "Epic") wisdomGain += 1;
  if (card.rarity === "Legendary") {
    wisdomGain += 2;
    legacyGain += 1;
  }
  const moments: DopamineMoment[] = [];
  if (card.rarity === "Legendary") {
    moments.push(moment("legendary", "Legendary Mental Model", `${card.title} can reshape the entire run. Big upside, real drawback.`, "positive"));
  } else if (card.rarity === "Epic" || card.rarity === "Rare") {
    moments.push(moment("rare-event", `${card.rarity} Card Drafted`, `${card.title} opens a less common path.`, "positive"));
  }
  if (state.investorDeck.some((item) => item.effect === card.effect)) {
    moments.push(moment("combo", "Deck Synergy", `${card.title} stacks with your existing ${card.effect} mental model.`, "positive"));
  }
  if (state.investorDeck.length + 1 === 3 || state.investorDeck.length + 1 === 5) {
    moments.push(moment("unlock", "Philosophy Layer Unlocked", `Your deck now has ${state.investorDeck.length + 1} active mental models.`, "neutral"));
  }
  return {
    ...state,
    phase: "observe",
    investorDeck: [...state.investorDeck, card],
    draftedCardIds: [...state.draftedCardIds, card.id],
    draftOffer: [],
    resources,
    wisdomScore: state.wisdomScore + wisdomGain,
    legacyScore: state.legacyScore + legacyGain,
    moments: moments.length ? moments : [moment("discovery", "New Mental Model", `${card.title} is now part of your philosophy.`, "neutral")],
    logs: [{
      id: `draft-${state.turn}-${card.id}`,
      turn: state.turn,
      title: `Drafted ${card.title}`,
      body: `${card.passiveAbility} Drawback: ${card.drawback}`,
      tone: "neutral",
    }, ...state.logs],
  };
}

export function finishAllocation(state: GameState): GameState {
  if (state.phase !== "think") return state;
  return { ...state, phase: "choose" };
}

export function beginCommit(state: GameState): GameState {
  if (state.phase !== "choose" || !state.actionUsed) return state;
  return { ...state, phase: "commit" };
}

export function setPositionValue(
  state: GameState,
  companyId: string,
  targetValue: number,
): GameState {
  if (state.phase !== "commit") return state;
  const company = state.companies.find((item) => item.id === companyId);
  if (!company) return state;
  const current = state.portfolio.find((item) => item.companyId === companyId);
  const currentValue = current ? current.shares * company.price : 0;
  const boundedTarget = clamp(targetValue, 0, currentValue + state.resources.capital);
  const difference = boundedTarget - currentValue;
  if (Math.abs(difference) < 1) return state;
  const shares = boundedTarget / company.price;
  const soldAfterDrop = difference < 0 && company.recentChange < -0.08;
  const behavior = { ...state.behavior };
  let wisdomDelta = 0;
  if (difference > 0) {
    if (company.traits.marketHype >= 8) behavior.hypeBuys += 1;
    if (company.traits.marketHype >= 8 && company.traits.balanceSheet <= 4) wisdomDelta -= 2;
    if (company.traits.marketHype <= 4 && company.traits.balanceSheet >= 6) {
      behavior.valueBuys += 1;
      wisdomDelta += 2;
    }
    if (company.traits.builderDna >= 7 && company.traits.executionSkill >= 7) {
      behavior.builderBuys += 1;
      wisdomDelta += 1;
    }
    if (hasCard(state, "builder") && (company.traits.builderDna >= 8 || company.traits.executionSkill >= 8)) wisdomDelta += 1;
    if (hasCard(state, "contrarian") && company.traits.marketHype <= 4 && company.traits.balanceSheet >= 6) wisdomDelta += 1;
    if (hasCard(state, "macro") && company.traits.commodityExposure >= 8) wisdomDelta += 1;
    if (hasCard(state, "optionality") && company.traits.optionality >= 8) wisdomDelta += 1;
    if (hasCard(state, "story") && company.traits.marketHype >= 8) wisdomDelta += company.traits.balanceSheet <= 4 ? -1 : 1;
  } else {
    behavior.trims += 1;
    if (soldAfterDrop) behavior.panicSells += 1;
    wisdomDelta += soldAfterDrop ? -2 : 1;
    if (hasCard(state, "allocator") && !soldAfterDrop) wisdomDelta += 1;
    if (hasCard(state, "risk") && soldAfterDrop) wisdomDelta += 1;
  }

  const portfolio = state.portfolio
    .filter((item) => item.companyId !== companyId)
    .concat(shares > 0.0001 ? [{
      companyId,
      shares,
      averageCost: difference > 0 && current
        ? ((current.averageCost * current.shares) + difference) / shares
        : current?.averageCost ?? company.price,
      invested: boundedTarget,
    }] : []);

  const records = state.records.map((record) => record.companyId === companyId ? {
    ...record,
    costBasis: difference > 0 ? record.costBasis + difference : record.costBasis,
    realizedValue: difference < 0 ? record.realizedValue + Math.abs(difference) : record.realizedValue,
  } : record);
  const moments: DopamineMoment[] = [];
  if (difference > 0 && Math.abs(difference) >= 250) {
    moments.push(moment("critical", "Critical Commitment", `${company.name} is now a meaningful part of the run. The next world response matters.`, "neutral"));
  }
  if (difference > 0 && wisdomDelta >= 3) {
    moments.push(moment("combo", "Smart Fit", `Your card deck, thesis, and company DNA lined up on ${company.name}.`, "positive"));
  }
  if (difference > 0 && company.traits.optionality >= 9 && company.traits.balanceSheet <= 4) {
    moments.push(moment("risk-reward", "High Convexity, Thin Ice", `${company.name} has huge upside shape and fragile survival.`, "neutral"));
  }
  if (difference < 0 && !soldAfterDrop) {
    moments.push(moment("perfect-timing", "Disciplined Trim", `You reduced exposure before fear forced the decision.`, "positive"));
  }

  return {
    ...state,
    portfolio,
    records,
    behavior,
    allocationChanged: true,
    wisdomScore: Math.max(0, state.wisdomScore + wisdomDelta),
    moments: moments.length ? moments : state.moments,
    resources: { ...state.resources, capital: state.resources.capital - difference },
    logs: [{
      id: `allocation-${state.turn}-${companyId}-${Date.now()}`,
      turn: state.turn,
      title: difference > 0 ? `Deepened commitment to ${company.name}` : `Reduced commitment to ${company.name}`,
      body: `${capital(Math.abs(difference))} ${difference > 0 ? "pledged to" : "freed from"} the thesis. ${investorTakeaway(company)}`,
      tone: difference > 0 ? "positive" : "neutral",
    }, ...state.logs],
  };
}

function useAction(
  state: GameState,
  action: PlayerAction,
  updates: Partial<GameState>,
  behaviorKey: keyof BehaviorStats,
): GameState {
  if (state.phase !== "choose" || state.actionUsed) return state;
  return {
    ...state,
    ...updates,
    actionUsed: true,
    lastAction: action,
    behavior: { ...state.behavior, [behaviorKey]: state.behavior[behaviorKey] + 1 },
    decisions: [...state.decisions, action],
    logs: [{
      id: `action-${state.turn}-${action.type}`,
      turn: state.turn,
      title: action.title,
      body: action.description,
      tone: "neutral",
    }, ...state.logs],
  };
}

export function performAction(
  state: GameState,
  type: PlayerActionType,
  companyId?: string,
): GameState {
  const company = state.companies.find((item) => item.id === companyId);
  const base = { type, companyId, turn: state.turn } as const;

  if (type === "investigate" && company) {
    const trait = nextHiddenTrait(company);
    const attentionCost = hasCard(state, "discovery") ? 1 : 2;
    if (!trait || state.resources.attention < attentionCost) return state;
    const action: PlayerAction = {
      ...base,
      title: `Investigated ${company.name}`,
      description: `${traitMap[trait].label} revealed at ${company.traits[trait]}/10 for ${attentionCost} Attention. Curiosity sharpened the thesis.`,
    };
    const moments = [
      moment(
        company.traits[trait] >= 9 ? "legendary" : "discovery",
        company.traits[trait] >= 9 ? "Legendary Discovery" : "Small Discovery",
        `${company.name} revealed ${traitMap[trait].label} at ${company.traits[trait]}/10.`,
        "positive",
      ),
    ];
    if (hasCard(state, "discovery")) {
      moments.push(moment("combo", "Discovery Engine", "Your Discovery card made investigation cheaper and more rewarding.", "positive"));
    }
    return useAction(state, action, {
      resources: { ...state.resources, attention: state.resources.attention - attentionCost },
      companies: state.companies.map((item) => item.id === companyId
        ? { ...item, revealedTraits: [...item.revealedTraits, trait] }
        : item),
      wisdomScore: state.wisdomScore + 3 + (hasCard(state, "discovery") ? 1 : 0),
      moments,
    }, "investigations");
  }

  if (type === "credibility" && company && state.resources.credibility >= 2) {
    const action: PlayerAction = {
      ...base,
      title: `Called in a trusted favor`,
      description: `Credibility opened a backchannel with ${company.name}: 25 capital returned and Management Quality revealed.`,
    };
    const reveal = company.revealedTraits.includes("managementQuality")
      ? company.revealedTraits
      : [...company.revealedTraits, "managementQuality" as TraitKey];
    return useAction(state, action, {
      companies: state.companies.map((item) => item.id === companyId
        ? { ...item, revealedTraits: reveal }
        : item),
      resources: {
        ...state.resources,
        capital: state.resources.capital + 25,
        credibility: state.resources.credibility - 2,
      },
      legacyScore: state.legacyScore + 3,
      wisdomScore: state.wisdomScore + 1 + (hasCard(state, "empire") ? 1 : 0),
      moments: [moment(hasCard(state, "empire") ? "combo" : "opportunity", "Backchannel Opened", `${company.name} gave you better access before the world reacted.`, "positive")],
    }, "credibilityPlays");
  }

  if (type === "patience" && company && state.resources.patience >= 2) {
    const action: PlayerAction = {
      ...base,
      title: `Declared conviction`,
      description: `${company.name} is protected from the first 10% of downside this turn. Patience converts fear into staying power.`,
    };
    return useAction(state, action, {
      resources: { ...state.resources, patience: state.resources.patience - 2 },
      companies: state.companies.map((item) => item.id === companyId
        ? { ...item, protectedThisTurn: true, convictionTurns: item.convictionTurns + 1 }
        : item),
      wisdomScore: state.wisdomScore + (positionValue(state, company.id) > 0 ? 2 : 0) + (hasCard(state, "compounder") ? 1 : 0),
      moments: [moment("perfect-timing", "Conviction Shield Armed", `${company.name} can absorb the first wave of downside this turn.`, "neutral")],
    }, "patiencePlays");
  }

  if (type === "optionality" && company) {
    const optionalityCost = hasCard(state, "optionality") ? 1 : 2;
    if (state.resources.optionality < optionalityCost) return state;
    const action: PlayerAction = {
      ...base,
      title: `Placed an asymmetric bet`,
      description: `${company.name} receives amplified event upside and downside this turn. Optionality is not safety; it is shape.`,
    };
    return useAction(state, action, {
      resources: { ...state.resources, optionality: state.resources.optionality - optionalityCost },
      companies: state.companies.map((item) => item.id === companyId
        ? { ...item, asymmetricBet: true }
        : item),
      wisdomScore: state.wisdomScore + 1 + (hasCard(state, "optionality") ? 1 : 0),
      moments: [moment("risk-reward", "Asymmetric Bet Armed", `${company.name} can now swing harder both ways.`, "neutral")],
    }, "optionalityBets");
  }

  if (type === "hold") {
    const action: PlayerAction = {
      ...base,
      title: "Held through uncertainty",
      description: "No scarce resource spent. Existing commitments build one turn of conviction and a small wisdom bonus.",
    };
    return useAction(state, action, {
      companies: state.companies.map((item) => positionValue(state, item.id) > 0
        ? { ...item, convictionTurns: item.convictionTurns + 1 }
        : item),
      legacyScore: state.legacyScore + state.portfolio.length,
      wisdomScore: state.wisdomScore + Math.min(3, state.portfolio.length) + (hasCard(state, "compounder") ? 1 : 0),
      moments: [moment(hasCard(state, "compounder") ? "combo" : "perfect-timing", "Hold Chosen", "You chose patience over activity. Now the world tests whether that was discipline or drift.", "neutral")],
    }, "holds");
  }

  return state;
}

function eventTargets(event: GameEvent, state: GameState, seed: number) {
  if (event.targets === "all") return { ids: state.companies.map((company) => company.id), seed };
  if (event.targets === "commodity") {
    return { ids: state.companies.filter((company) => company.commodity === event.commodity).map((company) => company.id), seed };
  }
  if (event.targets === "archetype") {
    return { ids: state.companies.filter((company) => company.archetype === event.archetype).map((company) => company.id), seed };
  }
  if (event.targets === "industry") {
    const ids = state.companies.filter((company) => company.industry === event.industry).map((company) => company.id);
    if (ids.length) return { ids, seed };
  }
  if (event.targets === "region") {
    const ids = state.companies.filter((company) => company.region === event.region).map((company) => company.id);
    if (ids.length) return { ids, seed };
  }
  const target = pick(state.companies, seed);
  return { ids: [target.item.id], seed: target.seed };
}

function qualityDrift(company: CompanyState) {
  const t = company.traits;
  const quality =
    t.builderDna * 0.12 + t.balanceSheet * 0.15 + t.managementQuality * 0.13 +
    t.infrastructure * 0.08 + t.executionSkill * 0.15 + t.geologicalLuck * 0.09 +
    t.optionality * 0.08 - t.politicalRisk * 0.1 - Math.max(0, t.marketHype - 7) * 0.12;
  return (quality - 3.8) / 100;
}

function philosophyModifier(state: GameState, company: CompanyState, event: GameEvent) {
  const t = company.traits;
  if (state.philosophy === "deep-value") {
    return { value: t.marketHype <= 4 && t.balanceSheet >= 6 ? 0.025 : t.marketHype >= 8 ? -0.025 : 0, text: "Neglect rewards value; hype taxes discipline." };
  }
  if (state.philosophy === "builder-believer") {
    return { value: (t.builderDna + t.executionSkill) >= 15 ? 0.025 : 0, text: "Execution quality compounds through noise." };
  }
  if (state.philosophy === "momentum-speculator") {
    const wave = event.id === "hype-bubble" || event.id === "titan-circles";
    return { value: wave ? 0.05 : company.momentum > 0.08 ? -0.025 : 0, text: wave ? "Momentum amplified the wave." : "Reversals punish late momentum." };
  }
  return { value: company.archetype === "cash-cow" ? 0.018 : 0, text: "Cash-flow assets dampen volatility and pay for patience." };
}

function lessonFor(state: GameState, worst: Mover, event: GameEvent) {
  if (event.id === "friction-tax") return "Strong balance sheets absorb pain that weak stories cannot.";
  if (state.behavior.hypeBuys > state.behavior.valueBuys + 1) return "You are leaning into charisma. Check whether the character can survive its own story.";
  if (state.lastAction?.type === "patience") return "Patience is useful when conviction rests on quality, not hope.";
  if (worst.changePercent < -18) return "Pain exposes sizing before it exposes intelligence.";
  return "The world moved first. Your job is to decide whether the thesis moved with it.";
}

export function drawEvent(state: GameState): GameState {
  if (state.phase !== "commit" || !state.actionUsed) return state;
  let eventPick = pick(events, state.seed);
  const previousEventTitle = state.logs.find((log) => log.id.startsWith("event-"))?.title;
  if (previousEventTitle === eventPick.item.title) {
    eventPick = pick(events.filter((event) => event.id !== eventPick.item.id), eventPick.seed);
  }
  const targets = eventTargets(eventPick.item, state, eventPick.seed);
  const before = netWorth(state);
  const wisdomBefore = state.wisdomScore;
  let seed = targets.seed;
  const impactLines: string[] = [];
  let philosophyText = "";

  const updatedCompanies = state.companies.map((company) => {
    const previousPrice = company.price;
    const isTarget = targets.ids.includes(company.id);
    let traits = { ...company.traits };
    let eventDelta = 0;
    if (isTarget) {
      eventPick.item.effects.forEach((effect) => {
        if (effect.trait && effect.traitDelta) {
          traits[effect.trait] = clamp(traits[effect.trait] + effect.traitDelta, 1, 10);
        }
        eventDelta += effect.priceDelta ?? 0;
      });
    }
    if (company.asymmetricBet && isTarget) eventDelta *= 1.55;
    if (company.protectedThisTurn && eventDelta < 0) eventDelta += 0.1;
    const philosophy = philosophyModifier(state, { ...company, traits }, eventPick.item);
    philosophyText = philosophyText || philosophy.text;
    const noise = random(seed);
    seed = noise.seed;
    const cashFlowDampener = state.philosophy === "cash-flow-collector" && company.archetype === "cash-cow" ? 0.55 : 1;
    const randomMove = (noise.value - 0.5) * company.volatility * cashFlowDampener;
    const rawMove =
      qualityDrift({ ...company, traits }) +
      (traits.marketHype - 5) * 0.004 -
      company.momentum * 0.08 +
      randomMove + eventDelta + philosophy.value;
    const cashFlowAdjusted = state.philosophy === "cash-flow-collector"
      ? rawMove * (rawMove >= 0 ? 0.8 : 0.7)
      : rawMove;
    const cardAdjusted =
      hasCard(state, "risk") && cashFlowAdjusted < -0.12 ? cashFlowAdjusted + 0.04 :
      hasCard(state, "compounder") && company.traits.balanceSheet >= 8 && cashFlowAdjusted < 0 ? cashFlowAdjusted * 0.75 :
      hasCard(state, "momentum") && company.traits.marketHype >= 8 && cashFlowAdjusted > 0 ? cashFlowAdjusted + 0.03 :
      cashFlowAdjusted;
    const totalMove = clamp(
      cardAdjusted,
      -0.44,
      0.48,
    );
    const price = Math.max(1, Number((previousPrice * (1 + totalMove)).toFixed(2)));
    if (isTarget) impactLines.push(`${company.name} ${totalMove >= 0 ? "+" : ""}${(totalMove * 100).toFixed(1)}%`);
    return {
      ...company,
      traits,
      previousPrice,
      price,
      history: [...company.history, price],
      momentum: totalMove,
      recentChange: totalMove,
      protectedThisTurn: false,
      asymmetricBet: false,
      lastChangeReason: isTarget ? eventPick.item.title : "World pressure",
    };
  });

  const afterState = { ...state, companies: updatedCompanies };
  const after = netWorth(afterState);
  const actionWisdom =
    state.lastAction?.type === "investigate" ? 1 :
    state.lastAction?.type === "hold" && after >= before ? 2 :
    state.lastAction?.type === "patience" && after >= before * 0.96 ? 2 :
    state.lastAction?.type === "optionality" && after < before ? -2 : 0;
  const survivalWisdom = after >= before ? 1 : worstSafeWisdom(updatedCompanies, targets.ids);
  const cardWisdom =
    (hasCard(state, "risk") && after < before ? 1 : 0) +
    (hasCard(state, "story") && eventPick.item.id === "hype-bubble" ? 2 : 0) +
    (hasCard(state, "macro") && eventPick.item.targets === "commodity" ? 2 : 0) +
    (hasCard(state, "empire") && state.portfolio.length >= 3 ? 1 : 0);
  const wisdomChange = actionWisdom + survivalWisdom + cardWisdom;
  const movers = updatedCompanies.map<Mover>((company) => ({
    companyId: company.id,
    name: company.name,
    ticker: company.ticker,
    changePercent: company.recentChange * 100,
  })).sort((a, b) => b.changePercent - a.changePercent);
  const bestMover = movers[0];
  const worstMover = movers[movers.length - 1];
  const targetNames = updatedCompanies.filter((company) => targets.ids.includes(company.id)).map((company) => company.name);
  const narrative = eventPick.item.narrative.replace("{company}", targetNames[0] ?? "The world");
  const effectText = eventPick.item.effects.map((effect) => {
    const parts: string[] = [];
    if (effect.priceDelta) parts.push(`${effect.priceDelta > 0 ? "+" : ""}${Math.round(effect.priceDelta * 100)}% event pressure`);
    if (effect.trait && effect.traitDelta) parts.push(`${traitMap[effect.trait].label} ${effect.traitDelta > 0 ? "+" : ""}${effect.traitDelta}`);
    return parts.join(", ");
  }).join(" · ");
  const moments: DopamineMoment[] = [];
  const rareWorldResponse = eventPick.item.targets === "region" || eventPick.item.targets === "industry";
  if (rareWorldResponse) {
    moments.push(moment("rare-event", "Rare World Response", `${eventPick.item.title} hit the ${eventPick.item.targets} layer, not just one company.`, eventPick.item.tone === "negative" ? "negative" : "positive"));
  }
  if (cardWisdom >= 2) {
    moments.push(moment("combo", "Card Combo Triggered", `Your Investor Cards added +${cardWisdom} Wisdom to this reaction.`, "positive"));
  }
  if (state.lastAction?.type === "patience" && after >= before * 0.96) {
    moments.push(moment("perfect-timing", "Perfect Timing", "Patience absorbed the hit before it became panic.", "positive"));
  }
  if (state.lastAction?.type === "optionality" && after > before) {
    moments.push(moment("risk-reward", "Convexity Paid", "The asymmetric bet found the right side of volatility.", "positive"));
  }
  if (state.lastAction?.type === "optionality" && after < before) {
    moments.push(moment("risk-reward", "Convexity Cut Both Ways", "The asymmetric bet amplified the wrong side of uncertainty.", "negative"));
  }
  if (after < before && after >= before * 0.98) {
    moments.push(moment("near-miss", "Near Miss", "The thesis bent but did not break. One different sizing choice could have flipped the turn.", "neutral"));
  }
  if (bestMover.changePercent >= 28) {
    moments.push(moment("legendary", "Legendary Breakout", `${bestMover.name} surged ${bestMover.changePercent.toFixed(1)}%.`, "positive"));
  }
  if (wisdomChange >= 4) {
    moments.push(moment("critical", "Intelligent Decision Rewarded", `This turn generated +${wisdomChange} Wisdom because timing, sizing, and philosophy lined up.`, "positive"));
  }
  const affectedOpportunity = updatedCompanies.find((company) => targets.ids.includes(company.id));
  if (affectedOpportunity && eventPick.item.tone === "positive" && affectedOpportunity.opportunity) {
    moments.push(moment("opportunity", "Unexpected Opportunity", `${affectedOpportunity.opportunity.title} made ${affectedOpportunity.name} more interesting this run.`, "positive"));
  }
  const resolvedEvent: ResolvedEvent = {
    event: eventPick.item,
    targetIds: targets.ids,
    impactLines,
    mechanicalEffect: effectText,
    portfolioBefore: before,
    portfolioAfter: after,
    portfolioChange: after - before,
    wisdomChange,
    moments,
    bestMover,
    worstMover,
    lessonHint: lessonFor(state, worstMover, eventPick.item),
    philosophyEffect: philosophyText,
  };
  const preferred = philosophyMap[state.philosophy].preferredArchetypes;
  const preferredValue = state.portfolio.reduce((total, position) => {
    const company = updatedCompanies.find((item) => item.id === position.companyId);
    return total + (company && preferred.includes(company.archetype) ? position.shares * company.price : 0);
  }, 0);
  const legacyGain = Math.round(preferredValue / 140 + state.portfolio.length + (state.lastAction?.type === "hold" ? 2 : 0));
  const log: TurnLog = {
    id: `event-${state.turn}-${eventPick.item.id}`,
    turn: state.turn,
    title: eventPick.item.title,
    body: `${narrative} Commitments ${after - before >= 0 ? "strengthened" : "weakened"} by ${capital(Math.abs(after - before))}. Wisdom ${wisdomChange >= 0 ? "+" : ""}${wisdomChange}.`,
    tone: after >= before ? "positive" : "negative",
  };
  return {
    ...state,
    phase: "world",
    companies: updatedCompanies,
    currentEvent: resolvedEvent,
    logs: [log, ...state.logs],
    legacyScore: state.legacyScore + legacyGain,
    wisdomScore: Math.max(0, wisdomBefore + wisdomChange),
    moments,
    seed,
  };
}

function worstSafeWisdom(companies: CompanyState[], targetIds: string[]) {
  const targeted = companies.filter((company) => targetIds.includes(company.id));
  if (targeted.some((company) => company.traits.balanceSheet <= 3 && company.recentChange < -0.12)) return -1;
  return 0;
}

export function revealResult(state: GameState): GameState {
  if (state.phase !== "world") return state;
  return { ...state, phase: "reflect" };
}

export function continueTurn(state: GameState): GameState {
  if (state.phase !== "reflect") return state;
  if (state.turn >= state.maxTurns) return { ...state, phase: "ended" };
  const nextTurn = state.turn + 1;
  const shouldDraft = draftTurns.has(nextTurn);
  const draft = shouldDraft ? generateDraftOffer(state.seed, state.draftedCardIds) : { offer: [], seed: state.seed };
  const moments = shouldDraft
    ? [moment("unlock", "New Draft Unlocked", "Choose another mental model. Your philosophy can pivot or double down.", "neutral")]
    : [moment("critical", "One More Turn", "A new world state is open. Observe what changed before acting.", "neutral")];
  return {
    ...state,
    phase: shouldDraft ? "draft" : "observe",
    turn: nextTurn,
    currentEvent: null,
    lastAction: null,
    actionUsed: false,
    allocationChanged: false,
    draftOffer: draft.offer,
    moments,
    turnStartValue: netWorth(state),
    resources: {
      ...state.resources,
      attention: clamp(state.resources.attention + 0.5, 0, 10),
      patience: clamp(state.resources.patience + 0.25, 0, 10),
    },
    seed: draft.seed,
  };
}

function totalResult(record: InvestmentRecord, state: GameState) {
  const position = state.portfolio.find((item) => item.companyId === record.companyId);
  const company = state.companies.find((item) => item.id === record.companyId);
  return record.realizedValue + (position && company ? position.shares * company.price : 0) - record.costBasis;
}

export function summarizeGame(state: GameState): GameSummary {
  const finalValue = netWorth(state);
  const results = state.records.filter((record) => record.costBasis > 0)
    .map((record) => ({ companyId: record.companyId, result: totalResult(record, state) }))
    .sort((a, b) => b.result - a.result);
  const name = (id?: string) => state.companies.find((company) => company.id === id)?.name ?? "No position";
  const behavior = state.behavior;
  const ranked = [
    ["research discipline", behavior.investigations],
    ["builder conviction", behavior.builderBuys + behavior.holds],
    ["hype seeking", behavior.hypeBuys],
    ["contrarian value", behavior.valueBuys],
    ["optionality seeking", behavior.optionalityBets],
    ["panic response", behavior.panicSells],
  ].sort((a, b) => Number(b[1]) - Number(a[1]));
  const dominantBehavior = String(ranked[0][0]);
  let investorArchetype = "Patient Compounder";
  if (behavior.panicSells >= 2) investorArchetype = "Panic Seller";
  else if (behavior.hypeBuys >= 3) investorArchetype = "Hype Chaser";
  else if (behavior.optionalityBets >= 3) investorArchetype = "Optionality Addict";
  else if (behavior.builderBuys + behavior.holds >= 4) investorArchetype = "Builder Backer";
  else if (behavior.valueBuys >= 3 && finalValue >= state.initialCapital) investorArchetype = "Contrarian Genius";
  else if (behavior.valueBuys >= 2) investorArchetype = "Deep Value Survivor";
  const worstResult = results[results.length - 1]?.result ?? 0;
  const lesson = behavior.hypeBuys > behavior.valueBuys
    ? "Narrative created opportunity, but balance sheets decided who survived."
    : behavior.panicSells > 0
      ? "You paid for certainty after volatility had already charged you."
      : behavior.optionalityBets > 1
        ? "Asymmetric bets only work when the downside stays survivable."
        : "Your strongest edge was matching patience with company quality.";
  const bestDecision = state.decisions.find((decision) => decision.type === "investigate")?.title
    ?? state.logs.find((log) => log.title.startsWith("Deepened"))?.title
    ?? "Preserved capital";
  const worstDecision = behavior.panicSells
    ? "Sold into a drawdown"
    : worstResult < 0 ? `Overcommitted to ${name(results[results.length - 1]?.companyId)}` : "Left optionality unused";
  return {
    finalValue,
    returnPercent: ((finalValue - state.initialCapital) / state.initialCapital) * 100,
    legacyScore: Math.max(0, state.legacyScore + Math.round((finalValue - state.initialCapital) / 18)),
    wisdomScore: state.wisdomScore,
    philosophyProgression: inferPhilosophyProgression(state),
    bestInvestment: name(results[0]?.companyId),
    worstInvestment: name(results[results.length - 1]?.companyId),
    bestDecision,
    worstDecision,
    dominantBehavior,
    investorArchetype,
    lesson,
  };
}
