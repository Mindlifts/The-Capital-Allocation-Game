"use client";

import { useEffect, useState } from "react";
import { archetypeMap, philosophies, philosophyMap } from "@/game/config";
import {
  beginCommit,
  beginAllocation,
  continueTurn,
  draftInvestorCard,
  drawEvent,
  finishAllocation,
  inferPhilosophyProgression,
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
import { InvestorDraft } from "@/game/components/InvestorDraft";
import { MomentStack } from "@/game/components/MomentStack";
import { Onboarding } from "@/game/components/Onboarding";
import { ResourceBar } from "@/game/components/ResourceBar";
import { TurnStepper } from "@/game/components/TurnStepper";

type Screen = "start" | "philosophy" | "game";
type MarketTab = "market" | "portfolio" | "intel";

const capital = (value: number) => `${Math.round(value).toLocaleString("en-US")}`;

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
          <span>ROGUELIKE FIELD TEST · DOCTRINE PROTOCOL</span>
        </nav>
        <section className="start-content">
          <span className="eyebrow">A 10-TURN ROGUELIKE OF CONVICTION UNDER UNCERTAINTY</span>
          <h1>Build a philosophy,<br />not a <em>portfolio</em>.</h1>
          <p>
            Companies are characters. Philosophies are powers. Events are the
            world answering your beliefs. Capital matters—but wisdom is the run.
          </p>
          <button type="button" className="primary-button large" onClick={() => setScreen("philosophy")}>
            Enter the doctrine room <span>→</span>
          </button>
          <div className="start-stats">
            <span><b>08</b> uncertain characters</span>
            <span><b>06</b> meaningful beats per turn</span>
            <span><b>10</b> turns to gain wisdom</span>
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
                  style={{ "--philosophy-accent": philosophy.accent } as React.CSSProperties}
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

  const investedValue = portfolioValue(state);
  const totalValue = netWorth(state);
  const positionIds = new Set(state.portfolio.map((position) => position.companyId));
  const visibleCompanies = tab === "portfolio"
    ? state.companies.filter((company) => positionIds.has(company.id))
    : state.companies;
  const latestEvent = state.logs.find((log) => log.id.startsWith("event-"));
  const progression = inferPhilosophyProgression(state);
  const phaseCopy = {
    draft: {
      title: "Draft",
      body: "Choose one mental model. It stays active and becomes part of your philosophy.",
      button: "Draft a card",
      changed: state.investorDeck.length ? "A new philosophy slot opened." : "Your run begins by choosing a mental model.",
      why: "Investor cards create persistent strengths, drawbacks, and playstyle pressure.",
      options: "Compare passive ability, drawback, rarity, and synergies.",
      tradeoff: "Every card makes one way of thinking easier and another way more dangerous.",
    },
    observe: {
      title: "Observe",
      body: state.turn === 1 ? "Meet the cast. Notice hype, danger, hidden instincts, and who already feels tempting." : "Something changed. Read the recap before touching anything.",
      button: "Think",
      changed: state.turn === 1 ? "The run begins with incomplete information." : latestEvent?.title ?? "The world moved.",
      why: state.turn === 1 ? "Your first edge is noticing what is visible and what is missing." : latestEvent?.body ?? "Events test commitments and doctrine.",
      options: "Inspect cards. Compare visible traits. Look for mystery, danger, and doctrine fit.",
      tradeoff: "Looking longer costs no resource, but the run only gives you ten turns.",
    },
    think: {
      title: "Think",
      body: "Form a thesis before acting. Which uncertainty is worth paying to reduce, amplify, or endure?",
      button: "Choose",
      changed: "No numbers move here; your interpretation does.",
      why: "Good decisions start by naming the tradeoff before the game pressures you.",
      options: "Target one character, preserve resources, or prepare to hold through noise.",
      tradeoff: "More information reduces surprise. More boldness creates upside and regret.",
    },
    choose: {
      title: "Choose",
      body: state.actionUsed ? state.lastAction?.description ?? "Power selected." : "Pick one doctrine power. This is your edge before capital goes to work.",
      button: "Commit",
      changed: state.actionUsed ? state.lastAction?.title ?? "Power selected" : "Your power is still unused.",
      why: "One action creates information or tension. You cannot do everything.",
      options: "Investigate, call in credibility, declare patience, take optionality, or hold.",
      tradeoff: "Every power spends scarcity or gives up a different edge.",
    },
    commit: {
      title: "Commit",
      body: "Now size the thesis. You can pledge, trim, abandon, and revise until you press World reacts.",
      button: "World reacts",
      changed: state.actionUsed ? `Your edge: ${state.lastAction?.title}` : "No edge selected.",
      why: "Sizing turns a thought into consequence.",
      options: "Open any card to pledge or trim capital. Changes remain editable until the next button is pressed.",
      tradeoff: "Bigger commitments create bigger lessons. Smaller commitments preserve optionality.",
    },
    world: {
      title: "World Reacts",
      body: "The world is moving. Your commitments and doctrine are being tested.",
      button: "Resolving…",
      changed: "A response card is resolving.",
      why: "The world is allowed to disagree with your thesis.",
      options: "Watch what gets hit and what survives.",
      tradeoff: "You already chose. Now you learn.",
    },
    reflect: {
      title: "Reflect",
      body: "Separate consequence from lesson before the next turn.",
      button: "Repeat",
      changed: state.currentEvent?.lessonHint ?? "A lesson is available.",
      why: "Wisdom comes from noticing the pattern, not just the outcome.",
      options: "Read best fate, hardest lesson, wisdom change, and remaining resources.",
      tradeoff: "Adapt too slowly and you repeat mistakes. Adapt too fast and you abandon true conviction.",
    },
    ended: { title: "", body: "", button: "", changed: "", why: "", options: "", tradeoff: "" },
  }[state.phase];

  const selectAction = (type: PlayerActionType, companyId?: string) => {
    setState((current) => current ? performAction(current, type, companyId) : current);
  };

  return (
    <main className="game-shell">
      <header className="market-header">
        <div className="brand-block">
          <span className="brand-mark">CA</span>
          <span><b>CAPITAL</b><small>DOCTRINE ROOM</small></span>
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
            <strong>STEP {Math.max(1, ["observe", "think", "choose", "commit", "world", "reflect"].indexOf(state.phase) + 1)} / 6</strong>
          </div>

          <div className="decision-questions">
            <div><span>WHAT CHANGED?</span><p>{phaseCopy.changed}</p></div>
            <div><span>WHY?</span><p>{phaseCopy.why}</p></div>
            <div><span>OPTIONS</span><p>{phaseCopy.options}</p></div>
            <div><span>TRADEOFF</span><p>{phaseCopy.tradeoff}</p></div>
          </div>

          {state.phase !== "world" && state.phase !== "reflect" && <MomentStack moments={state.moments} />}

          <div className="market-toolbar">
            <div>
              <span className="eyebrow">NORTHSTAR DECISION ROOM</span>
              <h1>{tab === "portfolio" ? "Your commitments" : tab === "intel" ? "Wisdom ledger" : "The uncertain cast"}</h1>
            </div>
            <div className="portfolio-totals">
              <span>Total capital <b>{capital(totalValue)}</b></span>
              <span>Committed <b>{capital(investedValue)}</b></span>
              <span>Wisdom <b>{state.wisdomScore}</b></span>
              <span>Turn change <b className={totalValue >= state.turnStartValue ? "gain" : "loss"}>
                {totalValue >= state.turnStartValue ? "+" : ""}{capital(totalValue - state.turnStartValue)}
              </b></span>
            </div>
          </div>

          {state.phase === "observe" && state.turn > 1 && latestEvent && (
            <div className="market-recap">
              <span>LAST TURN</span><strong>{latestEvent.title}</strong><p>{latestEvent.body}</p>
            </div>
          )}

          <div className="market-tabs">
            <button type="button" className={tab === "market" ? "active" : ""} onClick={() => setTab("market")}>Cast <span>{state.companies.length}</span></button>
            <button type="button" className={tab === "portfolio" ? "active" : ""} onClick={() => setTab("portfolio")}>Commitments <span>{state.portfolio.length}</span></button>
            <button type="button" className={tab === "intel" ? "active" : ""} onClick={() => setTab("intel")}>Wisdom log <span>{state.logs.length}</span></button>
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
              <span>◇</span><h2>No thesis committed</h2><p>Optionality is useful. Permanent indecision is not.</p>
              <button type="button" className="text-button" onClick={() => setTab("market")}>Read the cast →</button>
            </div>
          )}
        </section>

        <aside className="decision-rail">
          <div className="rail-section turn-command">
            <span className="eyebrow">CURRENT COMMAND</span>
            <h2>{phaseCopy.title}</h2>
            <p>{phaseCopy.body}</p>
          </div>

          {state.phase === "choose" && (
            <div className="rail-section global-action">
              <span className="eyebrow">NO COMPANY REQUIRED</span>
              <button type="button" disabled={state.actionUsed} onClick={() => selectAction("hold")}>
                <b>Hold through uncertainty</b>
                <span>Spend nothing · build conviction</span>
              </button>
              {state.actionUsed && <p className="action-confirmed">✓ {state.lastAction?.title}</p>}
            </div>
          )}

          <div className="rail-section mandate">
            <span className="eyebrow">PHILOSOPHY FORMING</span>
            <h2>{progression.primary.name}</h2>
            <p>{progression.evolution}</p>
            <div className="identity-meter">
              {progression.identities.slice(0, 3).map((identity) => (
                <div key={identity.key}>
                  <span>{identity.name}</span>
                  <i><b style={{ width: `${Math.min(100, identity.score * 7)}%` }} /></i>
                </div>
              ))}
            </div>
            <p className="identity-hint">{progression.primary.description}</p>
          </div>

          <div className="rail-section active-deck">
            <span className="eyebrow">INVESTOR CARDS</span>
            <h2>{state.investorDeck.length ? `${state.investorDeck.length} active` : "No cards yet"}</h2>
            <div className="deck-list">
              {state.investorDeck.slice(-5).map((card) => (
                <div className={`mini-investor-card mini-${card.rarity.toLowerCase()}`} key={card.id}>
                  <span>{card.icon}</span>
                  <div><b>{card.title}</b><small>{card.rarity} · {card.effect}</small></div>
                </div>
              ))}
            </div>
            {!state.investorDeck.length && <p>Your first draft will become the seed of your philosophy.</p>}
          </div>

          <div className="rail-section mandate">
            <span className="eyebrow">STARTING POWER</span>
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
              disabled={state.phase === "choose" && !state.actionUsed}
              onClick={() => {
                setState((current) => {
                  if (!current) return current;
                  if (current.phase === "observe") return beginAllocation(current);
                  if (current.phase === "think") return finishAllocation(current);
                  if (current.phase === "choose") return beginCommit(current);
                  if (current.phase === "commit") return drawEvent(current);
                  return current;
                });
              }}
            >
              <span>{phaseCopy.button}</span><b>→</b>
            </button>
            {state.phase === "choose" && !state.actionUsed && <small>Choose a power before committing capital.</small>}
          </div>
        <p className="rail-note">FICTIONAL STRATEGY MECHANICS · NO REAL MARKET DATA</p>
        </aside>
      </div>

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
