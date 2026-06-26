"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { archetypeMap, industryMap, philosophies, philosophyMap, regionMap, traitMap } from "@/game/config";
import {
  chooseOpportunityAction,
  confirmOpportunityReason,
  continueTurn,
  currentOpportunity,
  draftInvestorCard,
  inferPhilosophyProgression,
  initializeGame,
  investorTakeaway,
  netWorth,
  opportunityReasons,
  philosophyUnlock,
  portfolioValue,
  positionValue,
  revealResult,
  reviseOpportunityAction,
  riskLevel,
  chooseRoute,
} from "@/game/engine";
import type { CompanyState, GameState, OpportunityActionType, PhilosophyKey } from "@/game/types";
import { EndScreen } from "@/game/components/EndScreen";
import { EventOverlay } from "@/game/components/EventOverlay";
import { InvestorDraft } from "@/game/components/InvestorDraft";
import { MomentStack } from "@/game/components/MomentStack";
import { Onboarding } from "@/game/components/Onboarding";
import { ResourceBar } from "@/game/components/ResourceBar";
import { WarRoomAudio } from "@/game/components/WarRoomAudio";
import { WarRoomTimelines } from "@/game/components/WarRoomTimelines";
import { RouteMap } from "@/game/components/RouteMap";

type Screen = "start" | "philosophy" | "game";

const capital = (value: number) => `${Math.round(value).toLocaleString("en-US")}`;

const actionCopy: Record<OpportunityActionType, { label: string; hint: string; icon: string }> = {
  invest: { label: "Invest", hint: "Commit capital to this thesis.", icon: "◇" },
  ignore: { label: "Ignore", hint: "Pass and preserve resources.", icon: "×" },
  research: { label: "Research", hint: "Spend 1 Attention to reveal a hidden trait.", icon: "◎" },
  watchlist: { label: "Watchlist", hint: "Keep the idea alive without capital.", icon: "◌" },
  hold: { label: "Hold", hint: "Keep conviction if you already own it.", icon: "◴" },
  trim: { label: "Trim", hint: "Cut the position in half.", icon: "↘" },
  sell: { label: "Sell", hint: "Exit and free capital.", icon: "!" },
};

const industryGlyph: Record<string, string> = {
  mining: "⛏",
  energy: "◆",
  technology: "✦",
  agriculture: "❦",
  shipping: "≈",
  biotech: "☤",
  infrastructure: "▣",
};

function visibleSignals(company: CompanyState) {
  return company.revealedTraits.slice(0, 5).map((trait) => ({
    key: trait,
    label: traitMap[trait].shortLabel,
    value: company.traits[trait],
  }));
}

function hiddenLabels(company: CompanyState) {
  return company.hiddenTraitOrder
    .filter((trait) => !company.revealedTraits.includes(trait))
    .slice(0, 3)
    .map((trait) => traitMap[trait].label);
}

function OpportunityCard({
  company,
  state,
}: {
  company: CompanyState;
  state: GameState;
}) {
  const position = positionValue(state, company.id);
  const change = company.recentChange * 100;
  const hidden = hiddenLabels(company);
  const themeGlyph = industryGlyph[company.industry] ?? "◇";
  const risk = riskLevel(company);
  return (
    <article className={`focused-card art-${company.industry} risk-aura-${risk.toLowerCase()}`}>
      <div className="focused-card-orbit" />
      <div className="card-corner corner-one" />
      <div className="card-corner corner-two" />
      <div className="card-corner corner-three" />
      <div className="card-corner corner-four" />
      <div className="focused-card-top">
        <span className="card-kicker">{industryMap[company.industry]?.label} · {regionMap[company.region]?.label}</span>
        <div className="card-badges">
          <span className={`risk-${risk.toLowerCase()}`}>{risk} risk</span>
          <span>Hype {company.traits.marketHype}/10</span>
        </div>
      </div>

      <div className="company-art-window" aria-hidden="true">
        <div className="painted-sky" />
        <div className="painted-mountains" />
        <div className="painted-ground" />
        <div className="painted-tower" />
        <div className="painted-glow" />
        <span className="art-glyph">{themeGlyph}</span>
        <small>{company.role}</small>
      </div>

      <div className="focused-title-row">
        <div>
          <p className="archetype-pill">{archetypeMap[company.archetype]?.label ?? company.archetype}</p>
          <h1>{company.name}</h1>
          <p>{company.tagline}</p>
        </div>
        <div className="focused-price">
          <span>Current value</span>
          <strong>{capital(company.price)}</strong>
          <b className={change >= 0 ? "gain" : "loss"}>{change >= 0 ? "+" : ""}{change.toFixed(1)}%</b>
        </div>
      </div>

      <p className="company-story">
        {company.name} wants {company.desire.toLowerCase()} but is haunted by {company.flaw.toLowerCase()}.
        This run adds: <strong>{company.opportunity.title}</strong> — {company.opportunity.lore}
      </p>

      <p className="choice-oath">You are not clicking a button. You are choosing what kind of thinker gets to survive this world.</p>

      <div className="signal-strip">
        {visibleSignals(company).map((signal) => (
          <div key={signal.key}>
            <span>{signal.label}</span>
            <strong>{signal.value}/10</strong>
          </div>
        ))}
      </div>

      <div className="hidden-strip">
        <span>Hidden information</span>
        {hidden.length ? hidden.map((label) => <b key={label}>Unrevealed: {label}</b>) : <b>All major traits revealed</b>}
      </div>

      <div className="takeaway-grid">
        <div>
          <span>Your ownership</span>
          <strong>{position > 0 ? capital(position) : "None"}</strong>
        </div>
        <div>
          <span>Recent change</span>
          <strong>{company.lastChangeReason}</strong>
        </div>
        <div>
          <span>Investor takeaway</span>
          <strong>{investorTakeaway(company)}</strong>
        </div>
      </div>
    </article>
  );
}

export default function CapitalGamePage() {
  const [screen, setScreen] = useState<Screen>("start");
  const [selectedPhilosophy, setSelectedPhilosophy] = useState<PhilosophyKey>("deep-value");
  const [state, setState] = useState<GameState | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [screen, state?.phase, state?.opportunityIndex]);

  const beginGame = () => {
    setState(initializeGame(selectedPhilosophy));
    setScreen("game");
    setShowOnboarding(true);
  };

  const restart = () => {
    setState(initializeGame(selectedPhilosophy));
    setScreen("game");
    setShowOnboarding(false);
  };

  if (screen === "start") {
    return (
      <main className="start-screen">
        <div className="star-field" />
        <nav className="game-nav">
          <span className="wordmark"><i>CA</i> CAPITAL ALLOCATION</span>
          <span>ROGUELIKE FIELD TEST · ONE DECISION AT A TIME</span>
        </nav>
        <section className="start-content">
          <span className="eyebrow">A 10-ROUND ROGUELIKE OF CONVICTION UNDER UNCERTAINTY</span>
          <h1>Build a philosophy,<br />one memorable decision at a time.</h1>
          <p>
            Companies are characters. Investor cards are mental models. Every round
            shows three focused opportunities, then the world answers.
          </p>
          <button type="button" className="primary-button large" onClick={() => setScreen("philosophy")}>
            Enter the doctrine room <span>→</span>
          </button>
          <div className="start-stats">
            <span><b>03</b> opportunities per round</span>
            <span><b>01</b> important decision at a time</span>
            <span><b>10</b> rounds to gain wisdom</span>
          </div>
        </section>
        <div className="start-card-stack" aria-hidden="true">
          <div className="ghost-card ghost-three" />
          <div className="ghost-card ghost-two" />
          <div className="preview-card">
            <span className="preview-kicker">WORLD RESPONSE</span>
            <b>◇</b>
            <h3>The rock does not care about your thesis.</h3>
            <div className="preview-line" /><div className="preview-line short" />
          </div>
        </div>
        <p className="disclaimer">FICTIONAL STRATEGY GAME · NO REAL COMPANIES · NO INVESTMENT ADVICE</p>
      </main>
    );
  }

  if (screen === "philosophy") {
    return (
      <main className="philosophy-screen">
        <nav className="game-nav">
          <button type="button" className="text-button" onClick={() => setScreen("start")}>← Exit</button>
          <span>CAPITAL ALLOCATION // DOCTRINE ROOM</span>
        </nav>
        <section className="philosophy-content">
          <span className="eyebrow">CHOOSE YOUR STARTING POWER</span>
          <h1>What do you believe<br />before the world pushes back?</h1>
          <p className="section-lead">Your doctrine changes outcomes, rewards certain behaviors, and creates a failure mode.</p>
          <div className="philosophy-grid">
            {philosophies.map((philosophy, index) => {
              const selected = philosophy.key === selectedPhilosophy;
              return (
                <button
                  type="button"
                  className={`philosophy-card ${selected ? "selected" : ""}`}
                  key={philosophy.key}
                  onClick={() => setSelectedPhilosophy(philosophy.key)}
                  style={{ "--philosophy-accent": philosophy.accent } as CSSProperties}
                >
                  <span className="philosophy-icon">{philosophy.icon}</span>
                  <small>DOCTRINE 0{index + 1}</small>
                  <h2>{philosophy.name}</h2>
                  <h3>{philosophy.subtitle}</h3>
                  <p>{philosophy.doctrine}</p>
                  <div className="philosophy-resources">
                    <span>◇ {philosophy.resources.capital}</span><span>◎ {philosophy.resources.attention}</span>
                    <span>◆ {philosophy.resources.credibility}</span><span>◴ {philosophy.resources.patience}</span>
                  </div>
                  <div className="philosophy-bonus">{philosophy.scoringBonus}</div>
                  <i>{selected ? "Selected" : "Choose doctrine"}</i>
                </button>
              );
            })}
          </div>
          <button type="button" className="primary-button philosophy-start" onClick={beginGame}>
            Begin as {philosophyMap[selectedPhilosophy].name} <span>→</span>
          </button>
        </section>
      </main>
    );
  }

  if (!state) return null;
  if (state.phase === "ended") return <EndScreen state={state} onRestart={restart} />;
  if (state.phase === "route") return <RouteMap state={state} onChoose={(routeId) => setState((current) => current ? chooseRoute(current, routeId) : current)} />;

  const company = currentOpportunity(state);
  const progression = inferPhilosophyProgression(state);
  const unlock = philosophyUnlock(state);
  const totalValue = netWorth(state);
  const investedValue = portfolioValue(state);
  const owned = company ? positionValue(state, company.id) > 0 : false;
  const hiddenCount = company ? hiddenLabels(company).length : 0;
  const actionOptions: OpportunityActionType[] = owned
    ? ["hold", "invest", "research", "trim", "sell"]
    : ["invest", "ignore", "research", "watchlist"];
  const activeReasons = state.pendingOpportunityAction && company ? opportunityReasons(company, state.pendingOpportunityAction) : [];
  const turnMemos = state.decisionMemos.filter((memo) => memo.turn === state.turn);
  const requiredAction = state.phase === "reason"
    ? "Choose the sentence that explains this decision."
    : state.phase === "draft"
      ? "Draft one mental model before the next opportunity."
      : "Read one opportunity, then choose one action.";

  return (
    <main className="focused-game-shell">
      <header className="focused-resource-header">
        <div className="brand-block">
          <span className="brand-mark">CA</span>
          <span><b>CAPITAL</b><small>ONE DECISION MODE</small></span>
        </div>
        <ResourceBar state={state} />
        <div className="turn-block">
          <span>ROUND</span>
          <strong>{String(state.turn).padStart(2, "0")} <i>/ {state.maxTurns}</i></strong>
        </div>
        <WarRoomAudio cue={`${state.phase}-${state.turn}-${state.opportunityIndex}`} />
      </header>

      <section className="focused-command">
        <div>
          <span className="eyebrow">ROUND {state.turn} / {state.maxTurns} · OPPORTUNITY {Math.min(state.opportunityIndex + 1, 3)} / 3</span>
          <h2>{requiredAction}</h2>
        </div>
        <div className="compact-portfolio">
          <span>Total <b>{capital(totalValue)}</b></span>
          <span>Committed <b>{capital(investedValue)}</b></span>
          <span>Wisdom <b>{state.wisdomScore}</b></span>
        </div>
      </section>

      {state.phase !== "world" && state.phase !== "reflect" && <MomentStack moments={state.moments} />}

      <section className="opportunity-scene" key={`${state.turn}-${state.opportunityIndex}-${state.phase === "reason" ? "reason" : "choice"}`}>
        {company && <OpportunityCard company={company} state={state} />}

        <aside className="decision-panel">
          <div className="panel-card philosophy-pulse">
            <span className="eyebrow">PHILOSOPHY FORMING</span>
            <h3>{progression.primary.name}</h3>
            <p>{progression.evolution}</p>
            <div className="philosophy-unlock"><span>LEVEL {unlock.level} POWER</span><b>{unlock.title}</b><small>{unlock.description}</small></div>
            <div className="identity-meter">
              {progression.identities.slice(0, 3).map((identity) => (
                <div key={identity.key}>
                  <span>{identity.name}</span>
                  <i><b style={{ width: `${Math.min(100, identity.score * 7)}%` }} /></i>
                </div>
              ))}
            </div>
          </div>

          {state.phase === "reason" && state.pendingOpportunityAction ? (
            <div className="panel-card action-stage">
              <span className="eyebrow">AUTOMATIC MEMO</span>
              <h3>Why this choice?</h3>
              <p>Pick one. No typing. Your reason will be used later when the game judges what worked.</p>
              <div className="reason-grid">
                {activeReasons.map((reason) => (
                  <button
                    type="button"
                    key={reason}
                    onClick={() => setState((current) => current ? confirmOpportunityReason(current, reason) : current)}
                  >
                    {reason}
                  </button>
                ))}
              </div>
              <button type="button" className="text-button revise-choice" onClick={() => setState((current) => current ? reviseOpportunityAction(current) : current)}>
                ← Change action
              </button>
            </div>
          ) : (
            <div className="panel-card action-stage">
              <span className="eyebrow">CHOOSE ONE ACTION</span>
              <h3>{company?.name ?? "Opportunity"} asks for a decision.</h3>
              <div className="action-grid">
                {actionOptions.map((action) => {
                  const disabled = action === "research" && (state.resources.attention < 1 || hiddenCount === 0);
                  return (
                    <button
                      type="button"
                      key={action}
                      disabled={disabled || state.phase === "draft"}
                      onClick={() => setState((current) => current ? chooseOpportunityAction(current, action) : current)}
                    >
                      <b>{actionCopy[action].icon} {action === "invest" && owned ? "Increase" : actionCopy[action].label}</b>
                      <span>{disabled ? "No hidden trait or Attention left." : actionCopy[action].hint}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="panel-card memo-stack">
            <span className="eyebrow">THIS ROUND'S MEMOS</span>
            {turnMemos.length ? turnMemos.map((memo) => (
              <p key={memo.id}><b>{memo.companyName}</b> · {actionCopy[memo.action].label}: {memo.reason}</p>
            )) : <p>No memo yet. Your first decision writes the run’s first sentence.</p>}
          </div>
        </aside>
      </section>

      <WarRoomTimelines state={state} />

      {(state.phase === "world" || state.phase === "reflect") && (
        <EventOverlay
          state={state}
          onReveal={() => setState((current) => current ? revealResult(current) : current)}
          onContinue={() => setState((current) => current ? continueTurn(current) : current)}
        />
      )}
      {showOnboarding && <Onboarding onDone={() => setShowOnboarding(false)} />}
      {state.phase === "draft" && (
        <InvestorDraft
          turn={state.turn}
          offer={state.draftOffer}
          deckSize={state.investorDeck.length}
          onDraft={(cardId) => setState((current) => current ? draftInvestorCard(current, cardId) : current)}
        />
      )}
    </main>
  );
}
