"use client";

import { useEffect } from "react";
import { eventKnowledge, industryMap, plainEffectLines, regionMap } from "../config";
import type { GameState } from "../types";
import { MomentStack } from "./MomentStack";

const capital = (value: number) => `${Math.round(value).toLocaleString("en-US")} capital`;

export function EventOverlay({
  state,
  onReveal,
  onContinue,
}: {
  state: GameState;
  onReveal: () => void;
  onContinue: () => void;
}) {
  const resolved = state.currentEvent;
  if (!resolved) return null;
  const { event } = resolved;
  const final = state.turn >= state.maxTurns;
  const affected = state.companies.filter((company) => resolved.targetIds.includes(company.id));
  const turnMemos = state.decisionMemos.filter((memo) => memo.turn === state.turn);
  const affectedNames = affected.map((company) => company.name).join(", ") || "The whole field";
  const knowledge = eventKnowledge(event);
  const effectLines = plainEffectLines(event);
  const targetReason =
    event.targets === "industry" ? `They operate in ${industryMap[event.industry ?? ""]?.label ?? "the affected industry"}.` :
    event.targets === "region" ? `They operate in ${regionMap[event.region ?? ""]?.label ?? "the affected region"}.` :
    event.targets === "archetype" ? "They share the company type targeted by this event." :
    event.targets === "commodity" ? `They depend directly on ${event.commodity ?? "the affected market"}.` :
    event.targets === "all" ? "This is a broad world event, so every company must adapt." :
    "This company was directly exposed to the event.";
  const resultHeadline = resolved.portfolioChange >= 0
    ? "Your decisions survived this round."
    : "The world pushed back on your decisions.";

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);

  return (
    <div className="event-backdrop">
      {state.phase === "world" ? (
        <div className={`event-card event-${event.tone}`}>
          <div className="event-orbit orbit-one" />
          <div className="event-orbit orbit-two" />
          <span className="event-kicker">{event.kicker}</span>
          <div className="event-art">
            <span>{event.tone === "positive" ? "↗" : event.tone === "negative" ? "↘" : "≈"}</span>
            <small>WORLD RESPONSE // {event.id.toUpperCase()}</small>
          </div>
          <p className="event-label">WORLD RESPONSE // TURN {state.turn}</p>
          <h2>{event.title}</h2>
          <p className="event-description">{knowledge.summary}</p>

          <div className="event-explainer-grid">
            <div>
              <span>WHAT ACTUALLY HAPPENED</span>
              <p>{knowledge.cause}</p>
            </div>
            <div>
              <span>WHO CHANGED — AND WHY</span>
              <p><b>{affectedNames}</b><small>{targetReason}</small></p>
            </div>
            <div>
              <span>WHAT THIS CHANGES</span>
              <p>{knowledge.consequence}</p>
            </div>
            <div className="plain-effects">
              <span>GAME EFFECT, IN PLAIN LANGUAGE</span>
              <ul>{effectLines.map((line) => <li key={line}>{line}</li>)}</ul>
            </div>
          </div>

          <div className="event-decision-prompt">
            <span>THE QUESTION THIS CREATES</span>
            <strong>{knowledge.decisionPrompt}</strong>
          </div>

          <div className="affected-companies">
            {affected.map((company) => <span key={company.id}>{company.name}</span>)}
          </div>
          <button type="button" className="primary-button" onClick={onReveal}>
            Reveal what changed <span>→</span>
          </button>
        </div>
      ) : (
        <div className="result-card">
          <div className="result-scroll">
            <span className="eyebrow">TURN {state.turn} // AFTER-ACTION REPORT</span>
            <h2>{resultHeadline}</h2>
            <div className={`portfolio-impact ${resolved.portfolioChange >= 0 ? "gain" : "loss"}`}>
              <span>Commitment impact</span>
              <strong>{resolved.portfolioChange >= 0 ? "+" : ""}{capital(resolved.portfolioChange)}</strong>
              <small>{capital(resolved.portfolioBefore)} → {capital(resolved.portfolioAfter)}</small>
            </div>
            <div className="mover-grid">
              <div>
                <span>Best fate</span>
                <strong>{resolved.bestMover.name}</strong>
                <b className="gain">+{resolved.bestMover.changePercent.toFixed(1)}%</b>
              </div>
              <div>
                <span>Hardest lesson</span>
                <strong>{resolved.worstMover.name}</strong>
                <b className="loss">{resolved.worstMover.changePercent.toFixed(1)}%</b>
              </div>
            </div>
            <div className="result-lines">
              <p><span>WHAT CHANGED</span>{knowledge.summary} {affectedNames} moved your total capital by {resolved.portfolioChange >= 0 ? "+" : ""}{capital(resolved.portfolioChange)}.</p>
              <p><span>WHY IT HAPPENED</span>{knowledge.cause}</p>
              <p><span>WHAT IT MEANS</span>{knowledge.consequence}</p>
              <p><span>YOUR NEXT QUESTION</span>{knowledge.decisionPrompt}</p>
              <p><span>YOUR EDGE</span>{state.lastAction?.description}</p>
              <p><span>PHILOSOPHY</span>{resolved.philosophyEffect}</p>
              <p><span>WISDOM</span>{resolved.wisdomChange >= 0 ? "+" : ""}{resolved.wisdomChange} wisdom this turn · current wisdom {state.wisdomScore}</p>
            </div>
            {turnMemos.length > 0 && (
              <div className="memo-feedback">
                <span>MEMOS TESTED</span>
                {turnMemos.map((memo) => (
                  <p key={memo.id}>
                    <b>{memo.companyName}</b>: “{memo.reason}”
                    {memo.result ? ` · ${memo.result.changePercent >= 0 ? "+" : ""}${memo.result.changePercent.toFixed(1)}% · ${memo.result.note}` : ""}
                  </p>
                ))}
              </div>
            )}
            <MomentStack moments={resolved.moments} />
            <div className="remaining-resources">
              <span>◎ {state.resources.attention.toFixed(1)}</span>
              <span>◆ {state.resources.credibility.toFixed(1)}</span>
              <span>◴ {state.resources.patience.toFixed(1)}</span>
              <span>✦ {state.resources.optionality.toFixed(1)}</span>
            </div>
          </div>
          <div className="result-footer">
            <button type="button" className="primary-button" onClick={onContinue}>
              {final ? "Open philosophy report" : `Continue to turn ${state.turn + 1}`} <span>→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
