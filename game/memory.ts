import { archetypeMap } from "./config";
import { summarizeGame } from "./engine";
import type { GameState, OpportunityActionType, PhilosophyIdentityKey } from "./types";

export const MEMORY_SCHEMA_VERSION = 1;
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
}

export interface PlayerMemory {
  schemaVersion: number;
  runs: CompletedRunMemory[];
}

export interface MemoryStore {
  load(): PlayerMemory;
  save(memory: PlayerMemory): void;
}

export const emptyPlayerMemory = (): PlayerMemory => ({ schemaVersion: MEMORY_SCHEMA_VERSION, runs: [] });

export class LocalStorageMemoryStore implements MemoryStore {
  load(): PlayerMemory {
    if (typeof window === "undefined") return emptyPlayerMemory();
    try {
      const parsed = JSON.parse(window.localStorage.getItem(MEMORY_STORAGE_KEY) ?? "null") as PlayerMemory | null;
      if (!parsed || !Array.isArray(parsed.runs)) return emptyPlayerMemory();
      return { schemaVersion: MEMORY_SCHEMA_VERSION, runs: parsed.runs };
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

export function createCompletedRunMemory(state: GameState): CompletedRunMemory {
  const summary = summarizeGame(state);
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
  };
}

export function rememberCompletedRun(store: MemoryStore, state: GameState) {
  const memory = store.load();
  const record = createCompletedRunMemory(state);
  const runs = [record, ...memory.runs.filter((run) => run.runId !== record.runId)].slice(0, 50);
  const next = { schemaVersion: MEMORY_SCHEMA_VERSION, runs };
  store.save(next);
  return next;
}

export function memoryInsights(memory: PlayerMemory) {
  if (!memory.runs.length) return ["No prior run exists. The game has not learned your habits yet."];
  const insights: string[] = [];
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
