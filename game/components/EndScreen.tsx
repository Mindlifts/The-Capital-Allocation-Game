"use client";

import { useEffect, useMemo } from "react";
import { philosophyMap } from "../config";
import { summarizeGame } from "../engine";
import type { GameState } from "../types";

const capital = (value: number) => `${Math.round(value).toLocaleString("en-US")} capital`;
const HISTORY_KEY = "capital-allocation-game-runs";

interface StoredRun {
  runId: number;
  philosophy: string;
  wisdom: number;
  legacy: number;
  finalValue: number;
}

export function EndScreen({ state, onRestart }: { state: GameState; onRestart: () => void }) {
  const summary = summarizeGame(state);
  const philosophy = philosophyMap[state.philosophy];
  const previousRuns = useMemo<StoredRun[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(window.localStorage.getItem(HISTORY_KEY) ?? "[]") as StoredRun[];
    } catch {
      return [];
    }
  }, []);
  const comparison = useMemo(() => {
    const prior = previousRuns.filter((run) => run.runId !== state.runId);
    if (!prior.length) return "First recorded run on this device. Future reports will compare your philosophy against this baseline.";
    const avgWisdom = prior.reduce((total, run) => total + run.wisdom, 0) / prior.length;
    const avgLegacy = prior.reduce((total, run) => total + run.legacy, 0) / prior.length;
    const priorSame = prior.filter((run) => run.philosophy === summary.philosophyProgression.primary.name).length;
    const wisdomDelta = summary.wisdomScore - avgWisdom;
    const legacyDelta = summary.legacyScore - avgLegacy;
    return `${wisdomDelta >= 0 ? "Above" : "Below"} your prior wisdom average by ${Math.abs(wisdomDelta).toFixed(1)}. ${legacyDelta >= 0 ? "Above" : "Below"} prior legacy by ${Math.abs(legacyDelta).toFixed(1)}. You have ended as ${summary.philosophyProgression.primary.name} ${priorSame} time${priorSame === 1 ? "" : "s"} before.`;
  }, [previousRuns, state.runId, summary]);

  useEffect(() => {
    const nextRun: StoredRun = {
      runId: state.runId,
      philosophy: summary.philosophyProgression.primary.name,
      wisdom: summary.wisdomScore,
      legacy: summary.legacyScore,
      finalValue: summary.finalValue,
    };
    const withoutDuplicate = previousRuns.filter((run) => run.runId !== state.runId);
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify([nextRun, ...withoutDuplicate].slice(0, 12)));
  }, [previousRuns, state.runId, summary.finalValue, summary.legacyScore, summary.philosophyProgression.primary.name, summary.wisdomScore]);

  return (
    <main className="end-screen">
      <div className="end-halo" />
      <section className="end-content investor-report">
        <span className="eyebrow">PHILOSOPHY REPORT // RUN {String(state.runId).slice(-4)}</span>
        <div className="legacy-mark">✦</div>
        <p className="report-label">YOUR PHILOSOPHY</p>
        <h1>{summary.philosophyProgression.primary.name}</h1>
        <p className="end-thesis">{summary.philosophyProgression.primary.description}</p>

        <div className="score-grid">
          <div className="hero-score">
            <span>Wisdom gained</span>
            <strong>{summary.wisdomScore}</strong>
            <em>curiosity, conviction, adaptation</em>
          </div>
          <div><span>Final capital</span><strong>{capital(summary.finalValue)}</strong><em className={summary.returnPercent >= 0 ? "gain" : "loss"}>{summary.returnPercent >= 0 ? "+" : ""}{summary.returnPercent.toFixed(1)}% capital outcome</em></div>
          <div><span>Legacy score</span><strong>{summary.legacyScore}</strong><em>what others remember</em></div>
          <div><span>Philosophy shape</span><strong>{summary.philosophyProgression.evolution}</strong><em>what your choices became</em></div>
          <div><span>Best read</span><strong>{summary.bestInvestment}</strong><em>your sharpest character judgment</em></div>
          <div><span>Hardest lesson</span><strong>{summary.worstInvestment}</strong><em>where the thesis broke</em></div>
        </div>

        <div className="philosophy-analysis">
          <div>
            <span>YOUR STRENGTHS</span>
            {summary.philosophyProgression.strengths.map((strength) => <p key={strength}>{strength}</p>)}
          </div>
          <div>
            <span>YOUR WEAKNESSES</span>
            {summary.philosophyProgression.weaknesses.map((weakness) => <p key={weakness}>{weakness}</p>)}
          </div>
          <div>
            <span>COMPARED TO PREVIOUS RUNS</span>
            <p>{comparison}</p>
          </div>
        </div>

        <div className="decision-report">
          <div><span>BEST DECISION</span><strong>{summary.bestDecision}</strong></div>
          <div><span>WORST DECISION</span><strong>{summary.worstDecision}</strong></div>
        </div>

        <div className="philosophy-verdict">
          <span style={{ color: philosophy.accent }}>{philosophy.icon}</span>
          <p>You entered with the power of a <strong>{philosophy.name}</strong>. Your choices turned that doctrine into something personal.</p>
        </div>

        <div className="end-actions">
          <button type="button" className="primary-button large" onClick={onRestart}>
            Shuffle the world and replay <span>↻</span>
          </button>
        </div>
        <p className="fictional-note">Hidden instincts and world responses will change next run · fictional strategy game</p>
      </section>
    </main>
  );
}
