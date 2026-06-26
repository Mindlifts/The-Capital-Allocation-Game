import type { GameState } from "../types";

function portfolioPath(state: GameState) {
  const owned = state.portfolio.map((position) => ({
    position,
    company: state.companies.find((company) => company.id === position.companyId),
  })).filter((item) => item.company);
  const length = Math.max(2, ...owned.map((item) => item.company?.history.length ?? 0));
  const values = Array.from({ length }, (_, index) => state.resources.capital + owned.reduce((sum, item) => {
    const history = item.company?.history ?? [];
    const price = history[Math.min(index, history.length - 1)] ?? item.company?.price ?? 0;
    return sum + item.position.shares * price;
  }, 0));
  const min = Math.min(...values);
  const max = Math.max(...values);
  return values.map((value, index) => {
    const x = values.length === 1 ? 0 : (index / (values.length - 1)) * 100;
    const y = max === min ? 50 : 92 - ((value - min) / (max - min)) * 76;
    return `${x},${y}`;
  }).join(" ");
}

export function WarRoomTimelines({ state }: { state: GameState }) {
  const memos = [...state.decisionMemos].slice(-5);
  const legacy = [...state.logs].sort((a, b) => a.turn - b.turn).slice(-5);
  return (
    <section className="war-room-chronicle" aria-label="Run timelines">
      <div className="chronicle-heading">
        <span className="eyebrow">WAR ROOM CHRONICLE</span>
        <p>The shape of this run, recorded as it happens.</p>
      </div>
      <div className="chronicle-grid">
        <article className="timeline-card portfolio-timeline">
          <header><span>01</span><div><b>Capital pulse</b><small>PORTFOLIO TIMELINE</small></div></header>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Portfolio movement">
            <defs><linearGradient id="pulse" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f4d685" stopOpacity=".36"/><stop offset="1" stopColor="#f4d685" stopOpacity="0"/></linearGradient></defs>
            <polyline points={`0,100 ${portfolioPath(state)} 100,100`} fill="url(#pulse)" stroke="none" />
            <polyline points={portfolioPath(state)} fill="none" stroke="#f4d685" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          </svg>
          <p><strong>{Math.round(state.resources.capital).toLocaleString("en-US")}</strong> liquid · {state.portfolio.length} active convictions</p>
        </article>
        <article className="timeline-card decision-timeline">
          <header><span>02</span><div><b>Decision trail</b><small>MEMOS YOU MUST LIVE WITH</small></div></header>
          <div className="timeline-track">
            {memos.length ? memos.map((memo) => <div key={memo.id}><i className={`memo-${memo.action}`} /><span><b>{memo.companyName}</b><small>{memo.action} · {memo.reason}</small></span></div>) : <p>Your first choice will mark the table.</p>}
          </div>
        </article>
        <article className="timeline-card legacy-timeline">
          <header><span>03</span><div><b>Legacy forming</b><small>WHAT THE WORLD REMEMBERS</small></div></header>
          <div className="legacy-path">
            {legacy.length ? legacy.map((log) => <div key={log.id} className={`legacy-${log.tone}`}><i>{log.turn}</i><span><b>{log.title}</b><small>{log.body}</small></span></div>) : <p>The world is waiting for your first commitment.</p>}
          </div>
        </article>
      </div>
    </section>
  );
}
