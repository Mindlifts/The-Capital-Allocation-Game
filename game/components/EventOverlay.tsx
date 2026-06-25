import type { GameState } from "../types";

export function EventOverlay({
  state,
  onContinue,
}: {
  state: GameState;
  onContinue: () => void;
}) {
  const resolved = state.currentEvent;
  if (!resolved) return null;
  const { event } = resolved;
  const eventTurn = state.logs[0]?.turn ?? state.turn;
  const final = eventTurn >= state.maxTurns;

  return (
    <div className="event-backdrop">
      <div className={`event-card event-${event.tone}`}>
        <div className="event-orbit orbit-one" />
        <div className="event-orbit orbit-two" />
        <span className="event-kicker">{event.kicker}</span>
        <div className="event-icon">
          {event.tone === "positive" ? "↗" : event.tone === "negative" ? "↘" : "≈"}
        </div>
        <p className="event-label">MARKET EVENT // TURN {eventTurn}</p>
        <h2>{event.title}</h2>
        <p className="event-description">{event.description}</p>
        <div className="impact-strip">
          {resolved.impactLines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>
        <p className="event-explanation">
          {state.logs[0]?.body}
        </p>
        <button type="button" className="primary-button" onClick={onContinue}>
          {final ? "Reveal my legacy" : "Return to the market"} <span>→</span>
        </button>
      </div>
    </div>
  );
}
