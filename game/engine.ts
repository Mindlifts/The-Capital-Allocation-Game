import { companies, events, philosophyMap, traitMap } from "./config";
import type {
  CompanyState,
  GameEvent,
  GameState,
  GameSummary,
  InvestmentRecord,
  PhilosophyKey,
  PortfolioPosition,
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

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

export function initializeGame(philosophy: PhilosophyKey, seed = 48271): GameState {
  const selected = philosophyMap[philosophy];
  const companyStates = companies.map<CompanyState>((company) => ({
    ...company,
    price: company.basePrice,
    previousPrice: company.basePrice,
    revealedTraits: [...company.initiallyVisible],
    history: [company.basePrice],
    momentum: 0,
    lastChangeReason: "Awaiting the opening bell.",
  }));

  return {
    phase: "playing",
    turn: 1,
    maxTurns: 10,
    philosophy,
    resources: { ...selected.resources },
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
      body: `${formatMoney(selected.resources.capital)} is ready to allocate. The market knows less than it thinks.`,
      tone: "neutral",
    }],
    currentEvent: null,
    legacyScore: 0,
    seed,
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

export function setPositionValue(
  state: GameState,
  companyId: string,
  targetValue: number,
): GameState {
  const company = state.companies.find((item) => item.id === companyId);
  if (!company || state.phase !== "playing") return state;

  const current = state.portfolio.find((item) => item.companyId === companyId);
  const currentValue = current ? current.shares * company.price : 0;
  const boundedTarget = clamp(targetValue, 0, currentValue + state.resources.capital);
  const difference = boundedTarget - currentValue;
  const shares = boundedTarget / company.price;

  const portfolio = state.portfolio
    .filter((item) => item.companyId !== companyId)
    .concat(
      shares > 0.0001
        ? [{
            companyId,
            shares,
            averageCost: difference > 0 && current
              ? ((current.averageCost * current.shares) + difference) / shares
              : current?.averageCost ?? company.price,
            invested: boundedTarget,
          }]
        : [],
    );

  const records = state.records.map((record) => {
    if (record.companyId !== companyId) return record;
    return {
      ...record,
      costBasis: difference > 0 ? record.costBasis + difference : record.costBasis,
      realizedValue: difference < 0 ? record.realizedValue + Math.abs(difference) : record.realizedValue,
    };
  });

  return {
    ...state,
    portfolio,
    records,
    resources: {
      ...state.resources,
      capital: state.resources.capital - difference,
    },
  };
}

export function investigateCompany(state: GameState, companyId: string): GameState {
  if (state.phase !== "playing" || state.resources.attention < 1) return state;
  const company = state.companies.find((item) => item.id === companyId);
  if (!company) return state;
  const hidden = (Object.keys(company.traits) as TraitKey[]).filter(
    (key) => !company.revealedTraits.includes(key),
  );
  if (!hidden.length) return state;
  const result = pick(hidden, state.seed);
  const trait = result.item;

  return {
    ...state,
    seed: result.seed,
    resources: { ...state.resources, attention: state.resources.attention - 1 },
    companies: state.companies.map((item) =>
      item.id === companyId
        ? { ...item, revealedTraits: [...item.revealedTraits, trait] }
        : item,
    ),
    logs: [{
      id: `investigate-${state.turn}-${companyId}-${trait}`,
      turn: state.turn,
      title: `Research note: ${company.name}`,
      body: `${traitMap[trait].label} revealed at ${company.traits[trait]}/10. Attention spent; uncertainty reduced.`,
      tone: company.traits[trait] >= 6 ? "positive" : "negative",
    }, ...state.logs],
  };
}

function eventTargets(event: GameEvent, state: GameState, seed: number) {
  if (event.targets === "all") return { ids: state.companies.map((company) => company.id), seed };
  if (event.targets === "commodity") {
    return { ids: state.companies.filter((company) => company.commodity === event.commodity).map((company) => company.id), seed };
  }
  if (event.targets === "archetype") {
    return { ids: state.companies.filter((company) => company.archetype === event.archetype).map((company) => company.id), seed };
  }
  const target = pick(state.companies, seed);
  return { ids: [target.item.id], seed: target.seed };
}

function qualityDrift(company: CompanyState) {
  const t = company.traits;
  const quality =
    t.builderDna * 0.12 +
    t.balanceSheet * 0.15 +
    t.managementQuality * 0.13 +
    t.infrastructure * 0.08 +
    t.executionSkill * 0.15 +
    t.geologicalLuck * 0.09 +
    t.optionality * 0.08 -
    t.politicalRisk * 0.1 -
    Math.max(0, t.marketHype - 7) * 0.12;
  return (quality - 3.8) / 100;
}

export function advanceTurn(state: GameState): GameState {
  if (state.phase !== "playing") return state;
  let eventPick = pick(events, state.seed);
  if (state.logs[0]?.title === eventPick.item.title) {
    eventPick = pick(events.filter((event) => event.id !== eventPick.item.id), eventPick.seed);
  }
  const targets = eventTargets(eventPick.item, state, eventPick.seed);
  let seed = targets.seed;
  const impactLines: string[] = [];

  const updatedCompanies = state.companies.map((company) => {
    const previousPrice = company.price;
    const isTarget = targets.ids.includes(company.id);
    let traits = { ...company.traits };
    let eventDelta = 0;
    let reason = "Fundamentals and market noise tug in opposite directions.";

    if (isTarget) {
      eventPick.item.effects.forEach((effect) => {
        if (effect.trait && effect.traitDelta) {
          traits[effect.trait] = clamp(traits[effect.trait] + effect.traitDelta, 1, 10);
        }
        eventDelta += effect.priceDelta ?? 0;
      });
      reason = eventPick.item.title;
    }

    const noise = random(seed);
    seed = noise.seed;
    const sentiment = (traits.marketHype - 5) * 0.004;
    const meanReversion = company.momentum * -0.08;
    const randomMove = (noise.value - 0.5) * company.volatility;
    const totalMove = clamp(
      qualityDrift({ ...company, traits }) + sentiment + meanReversion + randomMove + eventDelta,
      -0.42,
      0.42,
    );
    const price = Math.max(1, Number((previousPrice * (1 + totalMove)).toFixed(2)));

    if (isTarget) {
      impactLines.push(`${company.ticker} ${totalMove >= 0 ? "+" : ""}${(totalMove * 100).toFixed(1)}%`);
    }

    return {
      ...company,
      traits,
      previousPrice,
      price,
      history: [...company.history, price],
      momentum: totalMove,
      lastChangeReason: reason,
    };
  });

  const targetNames = updatedCompanies
    .filter((company) => targets.ids.includes(company.id))
    .map((company) => company.name);
  const narrative = eventPick.item.narrative.replace(
    "{company}",
    targetNames[0] ?? "The market",
  );
  const resolvedEvent: ResolvedEvent = {
    event: eventPick.item,
    targetIds: targets.ids,
    impactLines,
  };
  const eventResourceEffect = eventPick.item.effects.find((effect) => effect.resource);
  const resources = { ...state.resources };
  if (eventResourceEffect?.resource) {
    resources[eventResourceEffect.resource] = clamp(
      resources[eventResourceEffect.resource] + (eventResourceEffect.resourceDelta ?? 0),
      0,
      10,
    );
  }
  resources.patience = clamp(resources.patience - (portfolioValue(state) > 0 ? 0.25 : 0), 0, 10);
  resources.optionality = clamp(resources.optionality + (state.resources.capital > state.initialCapital * 0.25 ? 0.2 : -0.1), 0, 10);

  const preferred = philosophyMap[state.philosophy].preferredArchetypes;
  const heldPreferredValue = state.portfolio.reduce((total, position) => {
    const company = updatedCompanies.find((item) => item.id === position.companyId);
    return total + (company && preferred.includes(company.archetype) ? position.shares * company.price : 0);
  }, 0);
  const legacyGain = Math.round(heldPreferredValue / 160 + resources.credibility * 0.3);
  const nextTurn = state.turn + 1;
  const isFinal = state.turn >= state.maxTurns;
  const log: TurnLog = {
    id: `event-${state.turn}-${eventPick.item.id}`,
    turn: state.turn,
    title: eventPick.item.title,
    body: `${narrative} ${impactLines.join(" · ")}.`,
    tone: eventPick.item.tone === "mixed" ? "neutral" : eventPick.item.tone,
  };

  return {
    ...state,
    phase: "event",
    turn: isFinal ? state.turn : nextTurn,
    companies: updatedCompanies,
    resources,
    logs: [log, ...state.logs],
    currentEvent: resolvedEvent,
    legacyScore: state.legacyScore + legacyGain,
    seed,
  };
}

export function acknowledgeEvent(state: GameState): GameState {
  if (state.phase !== "event") return state;
  const completedTurn = state.logs[0]?.turn ?? 0;
  return {
    ...state,
    phase: completedTurn >= state.maxTurns ? "ended" : "playing",
    currentEvent: null,
  };
}

function totalResult(record: InvestmentRecord, state: GameState) {
  const position = state.portfolio.find((item) => item.companyId === record.companyId);
  const company = state.companies.find((item) => item.id === record.companyId);
  return record.realizedValue + (position && company ? position.shares * company.price : 0) - record.costBasis;
}

export function summarizeGame(state: GameState): GameSummary {
  const finalValue = netWorth(state);
  const results = state.records
    .filter((record) => record.costBasis > 0)
    .map((record) => ({ companyId: record.companyId, result: totalResult(record, state) }))
    .sort((a, b) => b.result - a.result);
  const companyName = (id?: string) =>
    state.companies.find((company) => company.id === id)?.name ?? "No position";
  const hypeExposure = state.portfolio.reduce((sum, position) => {
    const company = state.companies.find((item) => item.id === position.companyId);
    return sum + (company?.traits.marketHype ?? 0) * position.shares * (company?.price ?? 0);
  }, 0) / Math.max(1, portfolioValue(state));
  const builderExposure = state.portfolio.reduce((sum, position) => {
    const company = state.companies.find((item) => item.id === position.companyId);
    return sum + (company?.traits.builderDna ?? 0) * position.shares * (company?.price ?? 0);
  }, 0) / Math.max(1, portfolioValue(state));
  const cashRatio = state.resources.capital / Math.max(1, finalValue);

  let style = philosophyMap[state.philosophy].name;
  let lesson = "You found a neglected compounder.";
  if (hypeExposure > 7.2) lesson = "You chased hype and paid for the privilege.";
  else if (builderExposure > 7) lesson = "You backed builders through volatility.";
  else if (cashRatio > 0.45) lesson = "You preserved capital but missed optionality.";
  else if (results.length && results[results.length - 1].result < -state.initialCapital * 0.12) lesson = "You overpaid for geological dreams.";

  if (cashRatio > 0.5) style = "The Patient Treasurer";
  else if (hypeExposure > 7) style = "The Narrative Surfer";
  else if (builderExposure > 7) style = "The Operator's Ally";

  return {
    finalValue,
    returnPercent: ((finalValue - state.initialCapital) / state.initialCapital) * 100,
    legacyScore: Math.max(0, state.legacyScore + Math.round((finalValue - state.initialCapital) / 20)),
    bestInvestment: companyName(results[0]?.companyId),
    worstInvestment: companyName(results[results.length - 1]?.companyId),
    style,
    lesson,
  };
}
