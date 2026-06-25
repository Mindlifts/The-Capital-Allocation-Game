import { philosophyMap } from "../config";
import { summarizeGame } from "../engine";
import type { GameState } from "../types";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function EndScreen({ state, onRestart }: { state: GameState; onRestart: () => void }) {
  const summary = summarizeGame(state);
  const philosophy = philosophyMap[state.philosophy];

  return (
    <main className="end-screen">
      <div className="end-halo" />
      <section className="end-content investor-report">
        <span className="eyebrow">PERSONAL INVESTOR REPORT // RUN {String(state.runId).slice(-4)}</span>
        <div className="legacy-mark">✦</div>
        <p className="report-label">YOUR INVESTOR ARCHETYPE</p>
        <h1>{summary.investorArchetype}</h1>
        <p className="end-thesis">{summary.lesson}</p>

        <div className="score-grid">
          <div className="hero-score">
            <span>Final portfolio</span>
            <strong>{money.format(summary.finalValue)}</strong>
            <em className={summary.returnPercent >= 0 ? "gain" : "loss"}>
              {summary.returnPercent >= 0 ? "+" : ""}{summary.returnPercent.toFixed(1)}% total return
            </em>
          </div>
          <div><span>Legacy score</span><strong>{summary.legacyScore}</strong><em>reputation outlives returns</em></div>
          <div><span>Dominant behavior</span><strong>{summary.dominantBehavior}</strong><em>what you repeatedly chose</em></div>
          <div><span>Best investment</span><strong>{summary.bestInvestment}</strong><em>your sharpest company read</em></div>
          <div><span>Worst investment</span><strong>{summary.worstInvestment}</strong><em>where the thesis broke</em></div>
        </div>

        <div className="decision-report">
          <div><span>BEST DECISION</span><strong>{summary.bestDecision}</strong></div>
          <div><span>WORST DECISION</span><strong>{summary.worstDecision}</strong></div>
        </div>

        <div className="philosophy-verdict">
          <span style={{ color: philosophy.accent }}>{philosophy.icon}</span>
          <p>You entered as a <strong>{philosophy.name}</strong>. Your choices turned that doctrine into something personal.</p>
        </div>

        <div className="end-actions">
          <button type="button" className="primary-button large" onClick={onRestart}>
            Shuffle the market and replay <span>↻</span>
          </button>
        </div>
        <p className="fictional-note">Traits and event order will change next run · fictional educational game</p>
      </section>
    </main>
  );
}
