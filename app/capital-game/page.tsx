"use client";

import { useEffect, useState } from "react";
import { archetypeMap, philosophies, philosophyMap } from "@/game/config";
import {
  acknowledgeEvent,
  advanceTurn,
  initializeGame,
  investigateCompany,
  netWorth,
  portfolioValue,
  setPositionValue,
} from "@/game/engine";
import type { GameState, PhilosophyKey } from "@/game/types";
import { CompanyCard } from "@/game/components/CompanyCard";
import { EndScreen } from "@/game/components/EndScreen";
import { EventOverlay } from "@/game/components/EventOverlay";
import { ResourceBar } from "@/game/components/ResourceBar";

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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [screen, state?.phase]);

  const beginGame = () => {
    setState(initializeGame(selectedPhilosophy));
    setSelectedCompany(null);
    setTab("market");
    setScreen("game");
  };

  const restart = () => {
    setState(null);
    setScreen("philosophy");
  };

  if (screen === "start") {
    return (
      <main className="start-screen">
        <div className="star-field" />
        <nav className="game-nav">
          <span className="wordmark"><i>CA</i> CAPITAL ALLOCATION</span>
          <span>FIELD TEST 01 · FICTIONAL MARKETS</span>
        </nav>
        <section className="start-content">
          <span className="eyebrow">A GAME OF CONVICTION UNDER UNCERTAINTY</span>
          <h1>
            Capital is only<br />
            <em>one</em> thing you spend.
          </h1>
          <p>
            Build a portfolio of fictional resource companies. Allocate money,
            attention, patience, credibility, and optionality across ten turns
            of imperfect information.
          </p>
          <button type="button" className="primary-button large" onClick={() => setScreen("philosophy")}>
            Take your seat <span>→</span>
          </button>
          <div className="start-stats">
            <span><b>08</b> companies</span>
            <span><b>10</b> turns</span>
            <span><b>∞</b> ways to be wrong</span>
          </div>
        </section>
        <div className="start-card-stack" aria-hidden="true">
          <div className="ghost-card ghost-three" />
          <div className="ghost-card ghost-two" />
          <div className="preview-card">
            <span className="preview-kicker">MARKET EVENT</span>
            <b>?</b>
            <h3>The rock does not care about your thesis.</h3>
            <div className="preview-line" />
            <div className="preview-line short" />
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
          <p className="section-lead">
            Your philosophy changes your starting resources and the kind of
            decisions that earn legacy.
          </p>
          <div className="philosophy-grid">
            {philosophies.map((philosophy) => {
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
                  <small>DOCTRINE 0{philosophies.indexOf(philosophy) + 1}</small>
                  <h2>{philosophy.name}</h2>
                  <h3>{philosophy.subtitle}</h3>
                  <p>{philosophy.doctrine}</p>
                  <div className="philosophy-resources">
                    <span>${philosophy.resources.capital}</span>
                    <span>◎ {philosophy.resources.attention}</span>
                    <span>◴ {philosophy.resources.patience}</span>
                    <span>✦ {philosophy.resources.optionality}</span>
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

      <div className="market-body">
        <section className="market-main">
          <div className="market-toolbar">
            <div>
              <span className="eyebrow">NORTHSTAR FICTIONAL EXCHANGE</span>
              <h1>{tab === "portfolio" ? "Your positions" : tab === "intel" ? "Intelligence ledger" : "The opportunity board"}</h1>
            </div>
            <div className="portfolio-totals">
              <span>Net worth <b>{money.format(totalValue)}</b></span>
              <span>Deployed <b>{money.format(investedValue)}</b></span>
            </div>
          </div>

          <div className="market-tabs">
            <button type="button" className={tab === "market" ? "active" : ""} onClick={() => setTab("market")}>
              Market <span>{state.companies.length}</span>
            </button>
            <button type="button" className={tab === "portfolio" ? "active" : ""} onClick={() => setTab("portfolio")}>
              Portfolio <span>{state.portfolio.length}</span>
            </button>
            <button type="button" className={tab === "intel" ? "active" : ""} onClick={() => setTab("intel")}>
              Turn log <span>{state.logs.length}</span>
            </button>
          </div>

          {tab === "intel" ? (
            <div className="intel-ledger">
              {state.logs.map((log) => (
                <article className={`log-entry log-${log.tone}`} key={log.id}>
                  <span>T{String(log.turn).padStart(2, "0")}</span>
                  <div>
                    <h3>{log.title}</h3>
                    <p>{log.body}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : visibleCompanies.length ? (
            <div className="company-grid">
              {visibleCompanies.map((company) => {
                const position = state.portfolio.find((item) => item.companyId === company.id);
                const positionValue = (position?.shares ?? 0) * company.price;
                return (
                  <CompanyCard
                    key={company.id}
                    company={company}
                    positionValue={positionValue}
                    availableCapital={state.resources.capital}
                    attention={state.resources.attention}
                    selected={selectedCompany === company.id}
                    onSelect={() => setSelectedCompany(selectedCompany === company.id ? null : company.id)}
                    onAllocate={(value) => setState((current) => current ? setPositionValue(current, company.id, value) : current)}
                    onInvestigate={() => setState((current) => current ? investigateCompany(current, company.id) : current)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="empty-portfolio">
              <span>◇</span>
              <h2>No capital deployed</h2>
              <p>The market cannot teach you much from all-cash.</p>
              <button type="button" className="text-button" onClick={() => setTab("market")}>Browse companies →</button>
            </div>
          )}
        </section>

        <aside className="decision-rail">
          <div className="rail-section mandate">
            <span className="eyebrow">YOUR MANDATE</span>
            <h2>{philosophyMap[state.philosophy].name}</h2>
            <p>{philosophyMap[state.philosophy].scoringBonus}</p>
            <div className="preferred-tags">
              {philosophyMap[state.philosophy].preferredArchetypes.map((key) => (
                <span key={key}>{archetypeMap[key].label}</span>
              ))}
            </div>
          </div>

          <div className="rail-section latest-log">
            <span className="eyebrow">LATEST INTELLIGENCE</span>
            <h3>{state.logs[0]?.title}</h3>
            <p>{state.logs[0]?.body}</p>
            <button type="button" className="text-button" onClick={() => setTab("intel")}>Read full ledger →</button>
          </div>

          <div className="rail-section turn-action">
            <span className="eyebrow">COMMIT THE TURN</span>
            <p>
              {state.portfolio.length
                ? `${money.format(investedValue)} is exposed to whatever happens next.`
                : "You can advance in cash, but optionality without action earns little legacy."}
            </p>
            <button
              type="button"
              className="advance-button"
              onClick={() => {
                setSelectedCompany(null);
                setState((current) => current ? advanceTurn(current) : current);
              }}
            >
              <span>Draw market event</span>
              <b>{String(state.turn).padStart(2, "0")} →</b>
            </button>
          </div>

          <p className="rail-note">
            Prices reflect fictional game mechanics only.
          </p>
        </aside>
      </div>

      {state.phase === "event" && (
        <EventOverlay
          state={state}
          onContinue={() => setState((current) => current ? acknowledgeEvent(current) : current)}
        />
      )}
    </main>
  );
}
