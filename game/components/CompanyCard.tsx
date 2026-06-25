import { archetypeMap, traitMap } from "../config";
import type { CompanyState, TraitKey } from "../types";
import { MiniChart } from "./MiniChart";

interface CompanyCardProps {
  company: CompanyState;
  positionValue: number;
  availableCapital: number;
  attention: number;
  selected: boolean;
  onSelect: () => void;
  onAllocate: (value: number) => void;
  onInvestigate: () => void;
}

export function CompanyCard({
  company,
  positionValue,
  availableCapital,
  attention,
  selected,
  onSelect,
  onAllocate,
  onInvestigate,
}: CompanyCardProps) {
  const archetype = archetypeMap[company.archetype];
  const move = ((company.price - company.previousPrice) / company.previousPrice) * 100;
  const allTraits = Object.keys(company.traits) as TraitKey[];
  const hiddenCount = allTraits.length - company.revealedTraits.length;
  const maxPosition = positionValue + availableCapital;

  return (
    <article
      className={`company-card ${selected ? "selected" : ""}`}
      onClick={onSelect}
      style={{ "--company-accent": archetype.color } as React.CSSProperties}
    >
      <div className="company-topline">
        <div className="company-symbol">
          <span>{company.ticker.slice(0, 2)}</span>
        </div>
        <div className="company-name">
          <h3>{company.name}</h3>
          <span>{company.ticker} · {company.commodity}</span>
        </div>
        <div className="company-price">
          <strong>${company.price.toFixed(2)}</strong>
          <span className={move >= 0 ? "gain" : "loss"}>
            {move >= 0 ? "+" : ""}{move.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="archetype-row">
        <span className="archetype-badge">{archetype.label}</span>
        <span className="volatility">{company.volatility >= .2 ? "Wild" : company.volatility >= .14 ? "Volatile" : "Steady"}</span>
      </div>

      <p className="tagline">{company.tagline}</p>
      <MiniChart values={company.history} />

      <div className="trait-grid">
        {company.revealedTraits.slice(0, 4).map((key) => {
          const trait = traitMap[key];
          const value = company.traits[key];
          const favorable = trait.positive ? value >= 6 : value <= 4;
          return (
            <div className="trait" key={key} title={trait.description}>
              <span>{trait.shortLabel}</span>
              <strong className={favorable ? "good-trait" : value >= 7 ? "bad-trait" : ""}>{value}</strong>
            </div>
          );
        })}
        {hiddenCount > 0 && (
          <div className="trait unknown-trait">
            <span>Unknown</span>
            <strong>? × {hiddenCount}</strong>
          </div>
        )}
      </div>

      {selected && (
        <div className="allocation-panel" onClick={(event) => event.stopPropagation()}>
          <div className="allocation-label">
            <span>Your conviction</span>
            <strong>${Math.round(positionValue)}</strong>
          </div>
          <input
            aria-label={`Allocation to ${company.name}`}
            type="range"
            min="0"
            max={Math.max(1, maxPosition)}
            step="25"
            value={Math.min(positionValue, maxPosition)}
            onChange={(event) => onAllocate(Number(event.target.value))}
          />
          <div className="quick-actions">
            {[0, 100, 250].map((amount) => (
              <button
                type="button"
                key={amount}
                onClick={() => onAllocate(Math.min(maxPosition, amount))}
              >
                {amount === 0 ? "Exit" : `$${amount}`}
              </button>
            ))}
            <button
              type="button"
              className="investigate-button"
              disabled={attention < 1 || hiddenCount === 0}
              onClick={onInvestigate}
            >
              ◎ Investigate
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
