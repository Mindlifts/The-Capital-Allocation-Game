import { inferPhilosophyProgression, philosophyUnlock } from "../engine";
import type { GameState, ResourceKey } from "../types";
import { ResourceBar } from "./ResourceBar";

const resourceLabel: Record<ResourceKey, string> = {
  capital: "Capital",
  attention: "Attention",
  credibility: "Credibility",
  patience: "Patience",
  optionality: "Optionality",
};

export function RouteMap({ state, onChoose }: { state: GameState; onChoose: (routeId: string) => void }) {
  const progression = inferPhilosophyProgression(state);
  const unlock = philosophyUnlock(state);
  return (
    <main className="route-screen">
      <div className="route-orbit" aria-hidden="true" />
      <div className="route-resource-bar"><ResourceBar state={state} /><span>ROUND {String(state.turn).padStart(2, "0")}</span></div>
      <header className="route-header">
        <div>
          <span className="eyebrow">ROUND {state.turn} / {state.maxTurns} · THE PATH FORKS</span>
          <h1>Choose the pressure<br />you are willing to face.</h1>
          <p>The route biases the next world response. There is no safe answer—only a tradeoff you understand.</p>
        </div>
        <aside className="route-identity">
          <span>PHILOSOPHY POWER</span>
          <strong>{progression.primary.name} · Level {unlock.level}</strong>
          <p><b>{unlock.title}</b> — {unlock.description}</p>
          {unlock.nextAt && <small>Next power at {unlock.nextAt} identity points</small>}
        </aside>
      </header>

      <section className="route-grid">
        {state.routeChoices.map((route, index) => (
          <button type="button" className={`route-card route-${route.kind}`} key={route.id} onClick={() => onChoose(route.id)}>
            <div className="route-card-top"><span>PATH 0{index + 1}</span><i>{route.kind}</i></div>
            <div className="route-sigil">{route.icon}</div>
            <h2>{route.title}</h2>
            <h3>{route.subtitle}</h3>
            <p>{route.lore}</p>
            <div className="route-tradeoff"><span>THE TRADEOFF</span><strong>{route.tradeoff}</strong></div>
            <div className="route-effects">
              {(Object.entries(route.resourceDelta) as Array<[ResourceKey, number]>).map(([key, value]) => (
                <em className={value >= 0 ? "gain" : "loss"} key={key}>{value >= 0 ? "+" : ""}{value} {resourceLabel[key]}</em>
              ))}
              {route.wisdomDelta > 0 && <em className="gain">+{route.wisdomDelta} Wisdom</em>}
            </div>
            <b className="route-select">Enter this path <span>→</span></b>
          </button>
        ))}
      </section>
      <div className="route-history-strip">
        <span>YOUR JOURNEY</span>
        {state.routeHistory.length ? state.routeHistory.slice(-5).map((route) => <b key={`${route.turn}-${route.routeId}`}>T{route.turn} · {route.title}</b>) : <b>No prior route. This choice begins the map.</b>}
      </div>
    </main>
  );
}
