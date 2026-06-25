"use client";

import { useEffect, useState } from "react";
import { archetypeMap, philosophies, philosophyMap } from "@/game/config";
import {
  beginAllocation,
  continueTurn,
  drawEvent,
  finishAllocation,
  initializeGame,
  netWorth,
  performAction,
  portfolioValue,
  revealResult,
  setPositionValue,
} from "@/game/engine";
import type { GameState, PhilosophyKey, PlayerActionType } from "@/game/types";
import { CompanyCard } from "@/game/components/CompanyCard";
import { EndScreen } from "@/game/components/EndScreen";
import { EventOverlay } from "@/game/components/EventOverlay";
import { Onboarding } from "@/game/components/Onboarding";
import { ResourceBar } from "@/game/components/ResourceBar";
import { TurnStepper } from "@/game/components/TurnStepper";

type Screen = "start" | "philosophy" | "game";
type MarketTab = "market" | "portfolio" | "intel";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function CapitalGamePage() {
  const [screen, setScreen] = useState<Screen>("start");
  const [selectedPhilosophy, setSelectedPhilosophy] = useState<PhilosophyKey>("deep-value");
  const [state, setState] = useState<GameState | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [tab, setTab] = useState<MarketTab>("market");
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [screen, state?.phase]);

  const beginGame = () => {
    setState(initializeGame(selectedPhilosophy));
    setSelectedCompany(null);
    setTab("market");
    setScreen("game");
    setShowOnboarding(true);
  };

  const restart = () => {
    setState(initializeGame(selectedPhilosophy));
    setSelectedCompany(null);
    setTab("market");
    setScreen("game");
    setShowOnboarding(false);
  };

  if (screen === "start") {
    return (
      <main className="start-screen">
        <div className="star-field" />
        <nav className="game-nav">
          <span className="wordmark"><i>CA</i> CAPITAL ALLOCATION</span>
          <span>FIELD TEST 02 · CONVICTION PROTOCOL</span>
        </nav>
        <section className="start-content">
          <span className="eyebrow">A 10-TURN GAME OF CONVICTION UNDER UNCERTAINTY</span>
          <h1>Capital is only<br /><em>one</em> thing you spend.</h1>
          <p>
            Read incomplete companies. Build positions. Spend scarce resources
            for an edge. Then find out whether your conviction was discipline—or narrative.
          </p>
          <button type="button" className="primary-button large" onClick={() => setScreen("philosophy")}>
            Take your seat <span>→</span>
          </button>
          <div className="start-stats">
            <span><b>08</b> collectible companies</span>
            <span><b>05</b> decisions per turn</span>
            <span><b>10</b> turns to build a legacy</span>
          </div>
        </section>
        <div className="start-card-stack" aria-hidden="true">
          <div className="ghost-card ghost-three" />
          <div className="ghost-card ghost-two" />
          <div className="preview-card">
            <span className="preview-kicker">MARKET EVENT</span>
            <b>?</b>
            <h3>The rock does not care about your thesis.</h3>
            <div className="preview-line" /><div className="preview-line short" />
          </div>
        </div>
        <p className="disclaimer">FICTIONAL EDUCATIONAL GAME · NOT INVESTMENT ADVICE</p>
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
          <span className="eyebrow">CHOOSE YOUR STARTING DOCTRINE</span>
          <h1>What do you believe<br />before the market tests you?</h1>
          <p className="section-lead">Your philosophy now changes event outcomes, not merely the score at the end.</p>
          <div className="philosophy-grid">
            {philosophies.map((philosophy, index) => {
              const selected = philosophy.key === selectedPhilosophy;
              return (
                <button
                  type="button"
                  className={`philosophy-card ${selected ? "selected" : ""}`}
                  key={philosophy.key}
                  onClick={() => setSelectedPhilosophy(philosophy.key)}
                  style={{ "--philosophy-accent": philosophy.accent } as React.CSSProperties}
                >
                  <span className="philosophy-icon">{philosophy.icon}</span>
                  <small>DOCTRINE 0{index + 1}</small>
                  <h2>{philosophy.name}</h2>
                  <h3>{philosophy.subtitle}</h3>
                  <p>{philosophy.doctrine}</p>
                  <div className="philosophy-resources">
                    <span>${philosophy.resources.capital}</span><span>◎ {philosophy.resources.attention}</span>
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

  const investedValue = portfolioValue(state);
  const totalValue = netWorth(state);
  const positionIds = new Set(state.portfolio.map((position) => position.companyId));
  const visibleCompanies = tab === "portfolio"
    ? state.companies.filter((company) => positionIds.has(company.id))
    : state.companies;
  const latestEvent = state.logs.find((log) => log.id.startsWith("event-"));
  const phaseCopy = {
    review: { title: "Review what changed", body: state.turn === 1 ? "Meet the market. Compare visible quality, risk, hype, and what remains hidden." : "Prices moved last turn. Decide whether the thesis changed—or only the quote.", button: "Start allocating" },
    allocate: { title: "Build or rebalance positions", body: "Open a company card. Add, trim, exit, or leave the position untouched.", button: "Lock allocations" },
    action: { title: "Choose one edge", body: state.actionUsed ? state.lastAction?.description ?? "Action selected." : "Spend one scarce resource—or hold—to shape the uncertainty ahead.", button: "Draw market event" },
    event: { title: "Event resolving", body: "The world is moving. Your positions and action are being tested.", button: "Resolving…" },
    result: { title: "Read the impact", body: "Separate price movement from thesis movement before continuing.", button: "Continue" },
    ended: { title: "", body: "", button: "" },
  }[state.phase];

  const selectAction = (type: PlayerActionType, companyId?: string) => {
    setState((current) => current ? performAction(current, type, companyId) : current);
  };

  return (
    <main className="game-shell">
      <header className="market-header">
        <div className="brand-block">
          <span className="brand-mark">CA</span>
          <span><b>CAPITAL</b><small>ALLOCATION ROOM</small></span>
        </div>
        <ResourceBar state={state} />
        <div className="turn-block">
          <span>TURN</span>
          <strong>{String(state.turn).padStart(2, "0")} <i>/ {state.maxTurns}</i></strong>
          <div className="turn-dots">
            {Array.from({ length: state.maxTurns }).map((_, index) => (
              <i key={index} className={index < state.turn ? "complete" : ""} />
            ))}
          </div>
        </div>
      </header>

      <TurnStepper phase={state.phase} />

      <div className="market-body">
        <section className="market-main">
          <div className="current-directive">
            <span>YOUR REQUIRED DECISION</span>
            <div><b>{phaseCopy.title}</b><p>{phaseCopy.body}</p></div>
            <strong>STEP {Math.max(1, ["review", "allocate", "action", "event", "result"].indexOf(state.phase) + 1)} / 5</strong>
          </div>

          <div className="market-toolbar">
            <div>
              <span className="eyebrow">NORTHSTAR FICTIONAL EXCHANGE</span>
              <h1>{tab === "portfolio" ? "Your positions" : tab === "intel" ? "Decision ledger" : "The opportunity board"}</h1>
            </div>
            <div className="portfolio-totals">
              <span>Portfolio value <b>{money.format(totalValue)}</b></span>
              <span>Capital deployed <b>{money.format(investedValue)}</b></span>
              <span>Turn change <b className={totalValue >= state.turnStartValue ? "gain" : "loss"}>
                {totalValue >= state.turnStartValue ? "+" : ""}{money.format(totalValue - state.turnStartValue)}
              </b></span>
            </div>
          </div>

          {state.phase === "review" && state.turn > 1 && latestEvent && (
            <div className="market-recap">
              <span>LAST TURN</span><strong>{latestEvent.title}</strong><p>{latestEvent.body}</p>
            </div>
          )}

          <div className="market-tabs">
            <button type="button" className={tab === "market" ? "active" : ""} onClick={() => setTab("market")}>Market <span>{state.companies.length}</span></button>
            <button type="button" className={tab === "portfolio" ? "active" : ""} onClick={() => setTab("portfolio")}>Portfolio <span>{state.portfolio.length}</span></button>
            <button type="button" className={tab === "intel" ? "active" : ""} onClick={() => setTab("intel")}>Decision log <span>{state.logs.length}</span></button>
          </div>

          {tab === "intel" ? (
            <div className="intel-ledger">
              {state.logs.map((log) => (
                <article className={`log-entry log-${log.tone}`} key={log.id}>
                  <span>T{String(log.turn).padStart(2, "0")}</span>
                  <div><h3>{log.title}</h3><p>{log.body}</p></div>
                </article>
              ))}
            </div>
          ) : visibleCompanies.length ? (
            <div className="company-grid">
              {visibleCompanies.map((company) => {
                const position = state.portfolio.find((item) => item.companyId === company.id);
                const value = (position?.shares ?? 0) * company.price;
                return (
                  <CompanyCard
                    key={company.id}
                    company={company}
                    positionValue={value}
                    availableCapital={state.resources.capital}
                    resources={state.resources}
                    phase={state.phase}
                    selected={selectedCompany === company.id}
                    actionUsed={state.actionUsed}
                    onSelect={() => setSelectedCompany(selectedCompany === company.id ? null : company.id)}
                    onAllocate={(target) => setState((current) => current ? setPositionValue(current, company.id, target) : current)}
                    onAction={(type) => selectAction(type, company.id)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="empty-portfolio">
              <span>◇</span><h2>No capital deployed</h2><p>Optionality is useful. Permanent indecision is not.</p>
              <button type="button" className="text-button" onClick={() => setTab("market")}>Browse companies →</button>
            </div>
          )}
        </section>

        <aside className="decision-rail">
          <div className="rail-section turn-command">
            <span className="eyebrow">CURRENT COMMAND</span>
            <h2>{phaseCopy.title}</h2>
            <p>{phaseCopy.body}</p>
          </div>

          {state.phase === "action" && (
            <div className="rail-section global-action">
              <span className="eyebrow">NO COMPANY REQUIRED</span>
              <button type="button" disabled={state.actionUsed} onClick={() => selectAction("hold")}>
                <b>Hold through volatility</b>
                <span>Spend nothing · build conviction</span>
              </button>
              {state.actionUsed && <p className="action-confirmed">✓ {state.lastAction?.title}</p>}
            </div>
          )}

          <div className="rail-section mandate">
            <span className="eyebrow">PHILOSOPHY EDGE</span>
            <h2>{philosophyMap[state.philosophy].name}</h2>
            <p>{philosophyMap[state.philosophy].scoringBonus}</p>
            <div className="preferred-tags">
              {philosophyMap[state.philosophy].preferredArchetypes.map((key) => <span key={key}>{archetypeMap[key].label}</span>)}
            </div>
          </div>

          <div className="rail-section turn-action">
            <span className="eyebrow">PRIMARY ACTION</span>
            <button
              type="button"
              className="advance-button"
              disabled={state.phase === "action" && !state.actionUsed}
              onClick={() => {
                setSelectedCompany(null);
                setState((current) => {
                  if (!current) return current;
                  if (current.phase === "review") return beginAllocation(current);
                  if (current.phase === "allocate") return finishAllocation(current);
                  if (current.phase === "action") return drawEvent(current);
                  return current;
                });
              }}
            >
              <span>{phaseCopy.button}</span><b>→</b>
            </button>
            {state.phase === "action" && !state.actionUsed && <small>Choose an action before drawing the event.</small>}
          </div>
          <p className="rail-note">FICTIONAL GAME MECHANICS · NO REAL MARKET DATA</p>
        </aside>
      </div>

      {(state.phase === "event" || state.phase === "result") && (
        <EventOverlay
          state={state}
          onReveal={() => setState((current) => current ? revealResult(current) : current)}
          onContinue={() => setState((current) => current ? continueTurn(current) : current)}
        />
      )}
      {showOnboarding && <Onboarding onDone={() => setShowOnboarding(false)} />}
    </main>
  );
}
