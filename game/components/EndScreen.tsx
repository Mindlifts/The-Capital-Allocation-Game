import { philosophyMap } from "../config";
import { summarizeGame } from "../engine";
import type { GameState } from "../types";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function EndScreen({
  state,
  onRestart,
}: {
  state: GameState;
  onRestart: () => void;
}) {
  const summary = summarizeGame(state);
  const philosophy = philosophyMap[state.philosophy];

  return (
    <main className="end-screen">
      <div className="end-halo" />
      <section className="end-content">
        <span className="eyebrow">ALLOCATION CYCLE COMPLETE // 10 TURNS</span>
        <div className="legacy-mark">✦</div>
        <h1>{summary.style}</h1>
        <p className="end-thesis">{summary.lesson}</p>

        <div className="score-grid">
          <div className="hero-score">
            <span>Final portfolio</span>
            <strong>{money.format(summary.finalValue)}</strong>
            <em className={summary.returnPercent >= 0 ? "gain" : "loss"}>
              {summary.returnPercent >= 0 ? "+" : ""}{summary.returnPercent.toFixed(1)}% total return
            </em>
          </div>
          <div>
            <span>Legacy score</span>
            <strong>{summary.legacyScore}</strong>
            <em>reputation outlives returns</em>
          </div>
          <div>
            <span>Best investment</span>
            <strong>{summary.bestInvestment}</strong>
            <em>your sharpest read</em>
          </div>
          <div>
            <span>Worst investment</span>
            <strong>{summary.worstInvestment}</strong>
            <em>tuition paid to the market</em>
          </div>
        </div>

        <div className="philosophy-verdict">
          <span style={{ color: philosophy.accent }}>{philosophy.icon}</span>
          <p>
            You entered as a <strong>{philosophy.name}</strong>. The market
            recorded what you actually did.
          </p>
        </div>

        <div className="end-actions">
          <button type="button" className="primary-button" onClick={onRestart}>
            Play another cycle <span>↻</span>
          </button>
        </div>
        <p className="fictional-note">
          A fictional educational game. No real companies, tickers, or investment advice.
        </p>
      </section>
    </main>
  );
}
