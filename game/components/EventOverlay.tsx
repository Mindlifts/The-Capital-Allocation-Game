import type { GameState } from "../types";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

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

  return (
    <div className="event-backdrop">
      {state.phase === "event" ? (
        <div className={`event-card event-${event.tone}`}>
          <div className="event-orbit orbit-one" />
          <div className="event-orbit orbit-two" />
          <span className="event-kicker">{event.kicker}</span>
          <div className="event-art">
            <span>{event.tone === "positive" ? "↗" : event.tone === "negative" ? "↘" : "≈"}</span>
            <small>CINEMATIC EVENT // {event.id.toUpperCase()}</small>
          </div>
          <p className="event-label">MARKET EVENT // TURN {state.turn}</p>
          <h2>{event.title}</h2>
          <p className="event-description">{event.description}</p>
          <div className="event-mechanics">
            <span>MECHANICAL EFFECT</span>
            <strong>{resolved.mechanicalEffect || "Broad market repricing"}</strong>
          </div>
          <div className="affected-companies">
            {affected.map((company) => <span key={company.id}>{company.name}</span>)}
          </div>
          <button type="button" className="primary-button" onClick={onReveal}>
            Reveal portfolio impact <span>→</span>
          </button>
        </div>
      ) : (
        <div className="result-card">
          <span className="eyebrow">TURN {state.turn} // AFTER-ACTION REPORT</span>
          <h2>{resolved.portfolioChange >= 0 ? "Conviction paid." : "The market collected tuition."}</h2>
          <div className={`portfolio-impact ${resolved.portfolioChange >= 0 ? "gain" : "loss"}`}>
            <span>Portfolio impact</span>
            <strong>{resolved.portfolioChange >= 0 ? "+" : ""}{money.format(resolved.portfolioChange)}</strong>
            <small>{money.format(resolved.portfolioBefore)} → {money.format(resolved.portfolioAfter)}</small>
          </div>
          <div className="mover-grid">
            <div>
              <span>Best mover</span>
              <strong>{resolved.bestMover.name}</strong>
              <b className="gain">+{resolved.bestMover.changePercent.toFixed(1)}%</b>
            </div>
            <div>
              <span>Worst mover</span>
              <strong>{resolved.worstMover.name}</strong>
              <b className="loss">{resolved.worstMover.changePercent.toFixed(1)}%</b>
            </div>
          </div>
          <div className="result-lines">
            <p><span>YOUR EDGE</span>{state.lastAction?.description}</p>
            <p><span>PHILOSOPHY</span>{resolved.philosophyEffect}</p>
            <p><span>LESSON HINT</span>{resolved.lessonHint}</p>
          </div>
          <div className="remaining-resources">
            <span>◎ {state.resources.attention.toFixed(1)}</span>
            <span>◆ {state.resources.credibility.toFixed(1)}</span>
            <span>◴ {state.resources.patience.toFixed(1)}</span>
            <span>✦ {state.resources.optionality.toFixed(1)}</span>
          </div>
          <button type="button" className="primary-button" onClick={onContinue}>
            {final ? "Open investor report" : `Continue to turn ${state.turn + 1}`} <span>→</span>
          </button>
        </div>
      )}
    </div>
  );
}
