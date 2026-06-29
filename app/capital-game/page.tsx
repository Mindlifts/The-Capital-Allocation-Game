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
import { companyMemoryLine, emptyPlayerMemory, institutionalTrustValue, localMemoryStore, memoryInsights } from "@/game/memory";
import type { PlayerMemory } from "@/game/memory";
import { LegacyArchive } from "@/game/components/LegacyArchive";

type Screen = "start" | "philosophy" | "game" | "archive";

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

const traitStories: Record<string, { high: [string, string]; low: [string, string] }> = {
  builderDna: { high: ["Builds when others present", "This team has turned difficult plans into real assets before."], low: ["Promise exceeds craft", "The ambition is clearer than the ability to build it." ] },
  geologicalLuck: { high: ["The ground keeps answering", "Early evidence suggests the underlying asset may be unusually strong."], low: ["Reality has been stubborn", "The core asset has not yet rewarded the confidence placed in it."] },
  balanceSheet: { high: ["Can survive a long winter", "It has enough financial room to endure delays without begging the market."], low: ["The clock is audible", "Another setback could force painful financing or a smaller future."] },
  managementQuality: { high: ["Calm hands at the table", "Leadership has earned trust through choices, not presentation."], low: ["The storyteller leads", "Leadership confidence runs ahead of the evidence."] },
  infrastructure: { high: ["The road already exists", "Access, logistics, and operating foundations make the plan more believable."], low: ["Stranded by the map", "The asset may be real, but reaching it remains part of the gamble."] },
  politicalRisk: { high: ["The map can say no", "Its future depends on institutions and agreements the company cannot command."], low: ["Rules are mostly known", "The company can focus more on execution than political survival."] },
  marketHype: { high: ["Everyone has heard the story", "Excitement creates momentum—and leaves little room for disappointment."], low: ["The room looks elsewhere", "Neglect may be an opportunity, or a warning that nobody cares yet."] },
  commodityExposure: { high: ["The cycle speaks loudly", "A change in industry demand can transform this company quickly."], low: ["Makes its own weather", "Its fate depends more on execution than on a broad market tide."] },
  optionality: { high: ["More than one future", "A single discovery, contract, or partner could rewrite the whole story."], low: ["One narrow road", "The company has little room to reinvent itself if the main plan fails."] },
  executionSkill: { high: ["Finishes difficult work", "The team has shown it can deliver when timelines become uncomfortable."], low: ["The final mile is unproven", "Good ideas keep arriving at the point where execution must begin."] },
};

function characterSignals(company: CompanyState) {
  return company.revealedTraits.slice(0, 3).map((key) => {
    const story = traitStories[key];
    const positive = key === "politicalRisk" ? company.traits[key] <= 5 : company.traits[key] >= 6;
    const [title, body] = story[positive ? "high" : "low"];
    return { key, label: traitMap[key].shortLabel, title, body };
  });
}

function unresolvedQuestion(company: CompanyState) {
  const hidden = company.hiddenTraitOrder.find((trait) => !company.revealedTraits.includes(trait));
  const questions: Record<string, string> = {
    managementQuality: "When pressure arrives, will leadership protect the mission—or protect its own story?",
    balanceSheet: "How many setbacks can the treasury survive before belief becomes dilution?",
    executionSkill: "Can this team finish the difficult work, or only explain why it is late?",
    geologicalLuck: "Is the promise beneath the ground real, or only beautifully interpreted?",
    politicalRisk: "Who outside the company can still stop this future from happening?",
    infrastructure: "What must exist before this ambition can become practical?",
    marketHype: "Are expectations creating opportunity—or consuming it in advance?",
    optionality: "Is there truly another path if the main thesis fails?",
    builderDna: "Does this organization create, or merely announce?",
    commodityExposure: "Is this a great company, or simply a passenger in a favorable cycle?",
  };
  return hidden ? questions[hidden] : "The major unknowns are gone. The remaining uncertainty is whether you can act on what you know.";
}

function OpportunityCard({
  company,
  state,
  playerMemory,
}: {
  company: CompanyState;
  state: GameState;
  playerMemory: PlayerMemory | null;
}) {
  const position = positionValue(state, company.id);
  const change = company.recentChange * 100;
  const hidden = hiddenLabels(company);
  const signals = characterSignals(company);
  const lastMemo = [...state.decisionMemos].reverse().find((memo) => memo.companyId === company.id);
  const rememberedBefore = companyMemoryLine(playerMemory, company.id);
  const memory = lastMemo
    ? `This run, you chose to ${lastMemo.action} because “${lastMemo.reason}”${lastMemo.result ? ` The world answered ${lastMemo.result.changePercent >= 0 ? "in your favor" : "against you"}.` : "."}`
    : rememberedBefore ?? `${company.name} has no history with you yet. This first judgment will become part of its story.`;
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
        {company.story}
        <span className="chapter-change"><b>THIS RUN’S NEW CHAPTER</b><strong>{company.opportunity.title}</strong>{company.opportunity.lore} The opportunity is real, but {company.opportunity.risk.toLowerCase()}</span>
      </p>

      <div className="choice-oath"><small>THE DECISION IN FRONT OF YOU</small><strong>{company.decisionQuestion}</strong></div>

      <div className="character-signals">
        {signals.map((signal) => <div className="character-signal" key={signal.key}><span>{signal.label}</span><strong>{signal.title}</strong><p>{signal.body}</p></div>)}
      </div>

      <div className="unresolved-thread"><span>?</span><div><small>THE QUESTION STILL HAUNTING THIS COMPANY</small><strong>{unresolvedQuestion(company)}</strong></div></div>

      <div className="relationship-memory">
        <div><span>Your stake</span><strong>{position > 0 ? capital(position) : "You have not backed them."}</strong></div>
        <div><span>What this company remembers</span><strong>{memory}</strong></div>
        <div><span>Latest chapter</span><strong>{company.lastChangeReason} · {change >= 0 ? "Hope is rising." : "Pressure is building."}</strong></div>
      </div>

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
  const [playerMemory, setPlayerMemory] = useState<PlayerMemory | null>(null);

  useEffect(() => {
    setPlayerMemory(localMemoryStore.load());
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [screen, state?.phase, state?.opportunityIndex]);

  const beginGame = () => {
    setState(initializeGame(selectedPhilosophy, undefined, { institutionalTrust: institutionalTrustValue(playerMemory) }));
    setScreen("game");
    setShowOnboarding(true);
  };

  const restart = () => {
    const latestMemory = localMemoryStore.load();
    setPlayerMemory(latestMemory);
    setState(initializeGame(selectedPhilosophy, undefined, { institutionalTrust: institutionalTrustValue(latestMemory) }));
    setScreen("game");
    setShowOnboarding(false);
  };

  if (screen === "start") {
    return (
      <main className="start-screen run-entry-screen">
        <div className="star-field" />
        <nav className="game-nav">
          <span className="wordmark"><i>CA</i> CAPITAL ALLOCATION</span>
          <span>A TEN-ROUND STORY OF BELIEF UNDER PRESSURE</span>
        </nav>
        <section className="start-content">
          <span className="eyebrow">THE WORLD WILL REMEMBER WHAT YOU BELIEVED</span>
          <h1>Back a character.<br />Become a philosophy.</h1>
          <p>
            Forty fictional company-characters wait behind the door. Each run reveals only a few. Choose who deserves your conviction, then live with what the world does to them.
          </p>
          <div className="identity-hook">Will you become a <span>Builder</span>, Contrarian, Compounder—or Hype Chaser?</div>
          <button type="button" className="primary-button large" onClick={() => setScreen("philosophy")}>
            Face your first choice <span>→</span>
          </button>
          <div className="run-teaser"><i>✦</i><span>{playerMemory?.runs.length ? memoryInsights(playerMemory)[0] : "Every run ends with a different philosophy report."}</span></div>
          <button type="button" className="archive-entry" onClick={() => setScreen("archive")}>Open Legacy Archive <span>{playerMemory?.runs.length ?? 0} artifacts</span></button>
        </section>
        <div className="landing-card-duel" aria-label="Examples of a company character and investor mental model">
          <article className="entry-card entry-company">
            <div className="entry-card-top"><span>COMPANY CHARACTER</span><i>HIGH UNCERTAINTY</i></div>
            <div className="entry-card-art" />
            <h2>Silver Mammoth</h2><h3>The Glittering Mystery</h3>
            <p>A colossal promise beneath a tiny treasury. It wants someone to believe before proof arrives.</p>
            <div className="entry-card-rule">Will you fund the dream—or recognize the trap?</div>
          </article>
          <article className="entry-card entry-investor">
            <div className="entry-card-top"><span>INVESTOR MENTAL MODEL</span><i>RARE</i></div>
            <div className="entry-portrait"><span>◇</span></div>
            <h2>The Contrarian</h2><h3>Power through neglect</h3>
            <p>You become strongest when the crowd has stopped looking—but loneliness can disguise a bad idea.</p>
            <div className="entry-card-rule">Buy what is misunderstood. Pay when neglect becomes deserved.</div>
          </article>
          <span className="duel-caption">A character asks. A philosophy answers.</span>
        </div>
        <p className="disclaimer">FICTIONAL STRATEGY GAME · NO REAL COMPANIES · NO INVESTMENT ADVICE</p>
      </main>
    );
  }

  if (screen === "archive") return <LegacyArchive memory={playerMemory ?? emptyPlayerMemory()} onClose={() => setScreen("start")} />;

  if (screen === "philosophy") {
    return (
      <main className="philosophy-screen">
        <nav className="game-nav">
          <button type="button" className="text-button" onClick={() => setScreen("start")}>← Exit</button>
          <span>CAPITAL ALLOCATION // DOCTRINE ROOM</span>
        </nav>
        <section className="philosophy-content">
          <span className="eyebrow">YOUR FIRST INSTINCT</span>
          <h1>What do you believe<br />before you know enough?</h1>
          <p className="section-lead">Choose quickly. This is only who you are at the beginning—the run will decide who you become.</p>
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
            Enter round one as {philosophyMap[selectedPhilosophy].name} <span>→</span>
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
        {company && <OpportunityCard company={company} state={state} playerMemory={playerMemory} />}

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
