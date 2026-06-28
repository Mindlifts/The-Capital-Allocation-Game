"use client";

import { useEffect, useMemo, useState } from "react";
import { philosophyMap } from "../config";
import { summarizeGame } from "../engine";
import type { GameState } from "../types";
import { WarRoomTimelines } from "./WarRoomTimelines";
import { createCompletedRunMemory, emptyPlayerMemory, localMemoryStore, memoryInsights, rememberCompletedRun } from "../memory";
import { RunArtifact } from "./RunArtifact";

const capital = (value: number) => `${Math.round(value).toLocaleString("en-US")} capital`;
export function EndScreen({ state, onRestart }: { state: GameState; onRestart: () => void }) {
  const summary = summarizeGame(state);
  const philosophy = philosophyMap[state.philosophy];
  const currentMemory = useMemo(() => createCompletedRunMemory(state), [state]);
  const [playerMemory, setPlayerMemory] = useState(emptyPlayerMemory);
  const discoveredTrust = playerMemory.hiddenSystems?.["institutional-trust"];
  const comparison = useMemo(() => {
    const prior = playerMemory.runs.filter((run) => run.runId !== state.runId);
    if (!prior.length) return "First recorded run on this device. Future reports will compare your philosophy against this baseline.";
    const avgWisdom = prior.reduce((total, run) => total + run.wisdomScore, 0) / prior.length;
    const avgLegacy = prior.reduce((total, run) => total + run.legacyScore, 0) / prior.length;
    const priorSame = prior.filter((run) => run.philosophy === summary.philosophyProgression.primary.name).length;
    const wisdomDelta = summary.wisdomScore - avgWisdom;
    const legacyDelta = summary.legacyScore - avgLegacy;
    return `${wisdomDelta >= 0 ? "Above" : "Below"} your prior wisdom average by ${Math.abs(wisdomDelta).toFixed(1)}. ${legacyDelta >= 0 ? "Above" : "Below"} prior legacy by ${Math.abs(legacyDelta).toFixed(1)}. You have ended as ${summary.philosophyProgression.primary.name} ${priorSame} time${priorSame === 1 ? "" : "s"} before.`;
  }, [playerMemory.runs, state.runId, summary]);

  useEffect(() => {
    setPlayerMemory(rememberCompletedRun(localMemoryStore, state));
  }, [state]);

  return (
    <main className="end-screen">
      <div className="end-halo" />
      <section className="end-content investor-report">
        <span className="eyebrow">PHILOSOPHY REPORT // RUN {String(state.runId).slice(-4)}</span>
        <div className="legacy-mark">✦</div>
        <p className="report-label">YOUR PHILOSOPHY</p>
        <h1>{summary.philosophyProgression.primary.name}</h1>
        <p className="end-thesis">{summary.philosophyProgression.primary.description}</p>

        <div className="artifact-reveal">
          <span>RUN ARTIFACT CREATED</span>
          <RunArtifact artifact={currentMemory} featured />
        </div>

        {discoveredTrust?.discoveredAtRun === state.runId && (
          <section className="hidden-system-discovery">
            <span>HIDDEN SYSTEM DISCOVERED</span>
            <div className="hidden-system-sigil">⌘</div>
            <p>You discovered...</p>
            <h2>Institutional Trust</h2>
            <strong>It existed all along.</strong>
            <blockquote>Across multiple runs, you kept commitments alive through uncertainty without repeatedly surrendering to panic. Patient institutions have noticed.</blockquote>
            <div><b>Permanent effect</b><p>Your reputation quietly improves access to rarer Investor Cards in future runs—even before this system was named.</p></div>
          </section>
        )}

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

        <div className="final-deck">
          <span>YOUR PHILOSOPHY DECK</span>
          <div>
            {state.investorDeck.map((card) => (
              <article className={`mini-investor-card mini-${card.rarity.toLowerCase()}`} key={card.id}>
                <span>{card.icon}</span>
                <div><b>{card.title}</b><small>{card.rarity} · {card.passiveAbility}</small></div>
              </article>
            ))}
          </div>
        </div>

        <div className="decision-report">
          <div><span>BEST DECISION</span><strong>{summary.bestDecision}</strong></div>
          <div><span>WORST DECISION</span><strong>{summary.worstDecision}</strong></div>
          <div><span>MOST COMMON REASON</span><strong>{summary.mostCommonReason}</strong></div>
          <div><span>BEST MEMO</span><strong>{summary.bestMemo}</strong></div>
          <div><span>HARDEST MEMO</span><strong>{summary.worstMemo}</strong></div>
          <div><span>BIGGEST LESSON</span><strong>{summary.lesson}</strong></div>
        </div>

        <div className="memory-report">
          <span>WHAT THE GAME WILL REMEMBER</span>
          <div>
            <p><small>Greatest success</small><strong>{currentMemory.greatestSuccess}</strong></p>
            <p><small>Biggest mistake</small><strong>{currentMemory.biggestMistake}</strong></p>
            <p><small>Average holding period</small><strong>{currentMemory.averageHoldingPeriod || "No completed hold"} {currentMemory.averageHoldingPeriod ? "turns" : ""}</strong></p>
            <p><small>Favorite company type</small><strong>{currentMemory.favoriteCompanyArchetype}</strong></p>
            <p><small>Favorite mental model</small><strong>{currentMemory.favoriteInvestorCard}</strong></p>
            <p><small>Conviction / panic</small><strong>{currentMemory.convictionDecisions} conviction · {currentMemory.panicDecisions} panic</strong></p>
          </div>
          <blockquote>{memoryInsights(playerMemory)[0]}</blockquote>
        </div>

        <WarRoomTimelines state={state} />

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
