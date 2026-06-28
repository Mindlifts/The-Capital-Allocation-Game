import { archetypeMap } from "./config";
import { summarizeGame } from "./engine";
import type { GameState, OpportunityActionType, PhilosophyIdentityKey } from "./types";

export const MEMORY_SCHEMA_VERSION = 2;
export const MEMORY_STORAGE_KEY = "capital-allocation-player-memory";

export interface CompanyRunMemory {
  companyId: string;
  companyName: string;
  action: OpportunityActionType;
  reason: string;
  outcomePercent: number | null;
  turn: number;
}

export interface CompletedRunMemory {
  runId: number;
  completedAt: string;
  startingPhilosophy: string;
  philosophy: string;
  philosophyKey: PhilosophyIdentityKey;
  biggestMistake: string;
  greatestSuccess: string;
  averageHoldingPeriod: number;
  favoriteCompanyArchetype: string;
  favoriteInvestorCard: string;
  panicDecisions: number;
  convictionDecisions: number;
  legacyScore: number;
  wisdomScore: number;
  finalValue: number;
  companyMemories: CompanyRunMemory[];
  artifactTitle: string;
  fateLabel: string;
  fate: string;
  legend: string;
  investorCards: string[];
  rememberedCompanies: string[];
}

export interface PlayerMemory {
  schemaVersion: number;
  runs: CompletedRunMemory[];
  hiddenSystems: Record<string, HiddenSystemMemory>;
}

export interface HiddenSystemMemory {
  id: string;
  name: string;
  value: number;
  discovered: boolean;
  discoveredAtRun: number | null;
  evidence: string[];
}

export interface MemoryStore {
  load(): PlayerMemory;
  save(memory: PlayerMemory): void;
}

const initialHiddenSystems = (): PlayerMemory["hiddenSystems"] => ({
  "institutional-trust": { id: "institutional-trust", name: "Institutional Trust", value: 0, discovered: false, discoveredAtRun: null, evidence: [] },
});

export const emptyPlayerMemory = (): PlayerMemory => ({ schemaVersion: MEMORY_SCHEMA_VERSION, runs: [], hiddenSystems: initialHiddenSystems() });

export class LocalStorageMemoryStore implements MemoryStore {
  load(): PlayerMemory {
    if (typeof window === "undefined") return emptyPlayerMemory();
    try {
      const parsed = JSON.parse(window.localStorage.getItem(MEMORY_STORAGE_KEY) ?? "null") as PlayerMemory | null;
      if (!parsed || !Array.isArray(parsed.runs)) return emptyPlayerMemory();
      return { schemaVersion: MEMORY_SCHEMA_VERSION, runs: parsed.runs, hiddenSystems: { ...initialHiddenSystems(), ...(parsed.hiddenSystems ?? {}) } };
    } catch {
      return emptyPlayerMemory();
    }
  }

  save(memory: PlayerMemory) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(memory));
  }
}

export const localMemoryStore = new LocalStorageMemoryStore();

function averageHoldingPeriod(state: GameState) {
  const periods: number[] = [];
  const openTurns = new Map<string, number>();
  [...state.decisionMemos].sort((a, b) => a.turn - b.turn).forEach((memo) => {
    if (memo.action === "invest" && !openTurns.has(memo.companyId)) openTurns.set(memo.companyId, memo.turn);
    if (memo.action === "sell" && openTurns.has(memo.companyId)) {
      periods.push(Math.max(1, memo.turn - (openTurns.get(memo.companyId) ?? memo.turn)));
      openTurns.delete(memo.companyId);
    }
  });
  openTurns.forEach((turn) => periods.push(Math.max(1, state.maxTurns + 1 - turn)));
  if (!periods.length) return 0;
  return Number((periods.reduce((total, period) => total + period, 0) / periods.length).toFixed(1));
}

function favoriteArchetype(state: GameState) {
  const counts = state.decisionMemos.filter((memo) => memo.action === "invest").reduce<Record<string, number>>((result, memo) => {
    result[memo.snapshot.archetype] = (result[memo.snapshot.archetype] ?? 0) + 1;
    return result;
  }, {});
  const key = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
  return key ? archetypeMap[key]?.label ?? key : "No consistent favorite";
}

function favoriteCard(state: GameState) {
  const counts = state.investorDeck.reduce<Record<string, number>>((result, card) => {
    result[card.title] = (result[card.title] ?? 0) + 1;
    return result;
  }, {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "No card drafted";
}

function artifactTitle(state: GameState, philosophy: string) {
  if (state.behavior.panicSells >= 2) return "The Broken Conviction";
  if (state.behavior.optionalityBets >= 3) return "The Door Collector";
  if (philosophy === "Builder") return state.behavior.holds >= 2 ? "The Forgotten Builder" : "The Restless Builder";
  if (philosophy === "Contrarian") return "The Last Dissenter";
  if (philosophy === "Compounder") return "The Long Vigil";
  if (philosophy === "Empire Builder") return "The Architect of Many Roads";
  if (philosophy === "Momentum Trader") return "The Rider of Bright Waves";
  if (philosophy === "Optionality Hunter") return "The Keeper of Unopened Doors";
  if (philosophy === "Macro Thinker") return "The Reader of Distant Storms";
  return "The Unfinished Philosophy";
}

function runFate(state: GameState, finalValue: number) {
  const negativeEvent = state.logs.find((log) => log.id.startsWith("event-") && log.tone === "negative");
  const positiveEvent = state.logs.find((log) => log.id.startsWith("event-") && log.tone === "positive");
  if (finalValue < state.initialCapital) return { label: "BROKEN BY", text: negativeEvent?.title ?? "A thesis that outlived its evidence" };
  return { label: "SURVIVED", text: positiveEvent?.title ?? "Ten turns of uncertainty" };
}

export function createCompletedRunMemory(state: GameState): CompletedRunMemory {
  const summary = summarizeGame(state);
  const fate = runFate(state, summary.finalValue);
  const latestByCompany = new Map<string, CompanyRunMemory>();
  state.decisionMemos.forEach((memo) => latestByCompany.set(memo.companyId, {
    companyId: memo.companyId,
    companyName: memo.companyName,
    action: memo.action,
    reason: memo.reason,
    outcomePercent: memo.result?.changePercent ?? null,
    turn: memo.turn,
  }));
  return {
    runId: state.runId,
    completedAt: new Date().toISOString(),
    startingPhilosophy: state.philosophy,
    philosophy: summary.philosophyProgression.primary.name,
    philosophyKey: summary.philosophyProgression.primary.key,
    biggestMistake: summary.worstDecision,
    greatestSuccess: summary.bestDecision,
    averageHoldingPeriod: averageHoldingPeriod(state),
    favoriteCompanyArchetype: favoriteArchetype(state),
    favoriteInvestorCard: favoriteCard(state),
    panicDecisions: state.behavior.panicSells,
    convictionDecisions: state.behavior.holds + state.behavior.builderBuys + state.behavior.patiencePlays,
    legacyScore: summary.legacyScore,
    wisdomScore: summary.wisdomScore,
    finalValue: summary.finalValue,
    companyMemories: [...latestByCompany.values()],
    artifactTitle: artifactTitle(state, summary.philosophyProgression.primary.name),
    fateLabel: fate.label,
    fate: fate.text,
    legend: `${summary.philosophyProgression.primary.name} by instinct. Remembered for ${summary.bestDecision.toLowerCase()}. Haunted by ${summary.worstDecision.toLowerCase()}.`,
    investorCards: state.investorDeck.map((card) => card.title),
    rememberedCompanies: [...new Set(state.decisionMemos.map((memo) => memo.companyName))],
  };
}

export function rememberCompletedRun(store: MemoryStore, state: GameState) {
  const memory = store.load();
  const record = createCompletedRunMemory(state);
  const runs = [record, ...memory.runs.filter((run) => run.runId !== record.runId)].slice(0, 50);
  const trust = memory.hiddenSystems["institutional-trust"] ?? initialHiddenSystems()["institutional-trust"];
  const trustGain = Math.max(0, record.convictionDecisions * 1.25 + record.legacyScore / 30 - record.panicDecisions * 2.5);
  const trustValue = Number((trust.value + trustGain).toFixed(1));
  const discovered = trust.discovered || (runs.length >= 3 && trustValue >= 18);
  const evidence = [
    ...(record.convictionDecisions >= 3 ? [`Run #${String(record.runId).slice(-4)}: conviction survived repeated uncertainty.`] : []),
    ...(record.panicDecisions === 0 ? [`Run #${String(record.runId).slice(-4)}: no panic decision was recorded.`] : []),
    ...trust.evidence,
  ].slice(0, 6);
  const next = {
    schemaVersion: MEMORY_SCHEMA_VERSION,
    runs,
    hiddenSystems: {
      ...memory.hiddenSystems,
      "institutional-trust": {
        ...trust,
        value: trustValue,
        discovered,
        discoveredAtRun: !trust.discovered && discovered ? record.runId : trust.discoveredAtRun,
        evidence,
      },
    },
  };
  store.save(next);
  return next;
}

export function institutionalTrustValue(memory: PlayerMemory | null) {
  return memory?.hiddenSystems?.["institutional-trust"]?.value ?? 0;
}

export function memoryInsights(memory: PlayerMemory) {
  if (!memory.runs.length) return ["No prior run exists. The game has not learned your habits yet."];
  const insights: string[] = [];
  if (memory.hiddenSystems?.["institutional-trust"]?.discovered) insights.push("Institutional Trust now follows you between runs.");
  const latest = memory.runs[0];
  const earlySale = latest.companyMemories.find((item) => item.action === "sell" && (item.outcomePercent ?? 0) > 3);
  const missedWinner = latest.companyMemories.find((item) => (item.action === "ignore" || item.action === "watchlist") && (item.outcomePercent ?? 0) > 8);
  if (earlySale) insights.push(`You sold ${earlySale.companyName} before it rose another ${earlySale.outcomePercent?.toFixed(1)}% last run.`);
  if (missedWinner) insights.push(`You passed on ${missedWinner.companyName} before it gained ${missedWinner.outcomePercent?.toFixed(1)}%.`);
  const philosophyCounts = memory.runs.reduce<Record<string, number>>((result, run) => {
    result[run.philosophy] = (result[run.philosophy] ?? 0) + 1;
    return result;
  }, {});
  const favorite = Object.entries(philosophyCounts).sort((a, b) => b[1] - a[1])[0];
  if (favorite) insights.push(`Across ${memory.runs.length} run${memory.runs.length === 1 ? "" : "s"}, you most often become ${favorite[0]}.`);
  if (!memory.runs.some((run) => run.philosophyKey === "builder")) insights.push("You have never completed a Builder run.");
  if (memory.runs.reduce((total, run) => total + run.panicDecisions, 0) >= 2) insights.push("The game remembers a pattern: pressure often turns your conviction into selling.");
  if (memory.runs.reduce((total, run) => total + run.convictionDecisions, 0) >= memory.runs.length * 3) insights.push("You repeatedly choose conviction over activity.");
  return insights.slice(0, 4);
}

export function companyMemoryLine(memory: PlayerMemory | null, companyId: string) {
  if (!memory) return null;
  for (const run of memory.runs) {
    const remembered = run.companyMemories.find((item) => item.companyId === companyId);
    if (!remembered) continue;
    const outcome = remembered.outcomePercent == null ? "The outcome remained unresolved." : remembered.outcomePercent >= 0
      ? `It later moved ${remembered.outcomePercent.toFixed(1)}% in your favor.`
      : `It later moved ${Math.abs(remembered.outcomePercent).toFixed(1)}% against you.`;
    return `Last run, you chose to ${remembered.action} because “${remembered.reason}” ${outcome}`;
  }
  return null;
}
