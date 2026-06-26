import { archetypeMap, traitMap } from "../config";
import { investorTakeaway, nextHiddenTrait, riskLevel } from "../engine";
import type { CompanyState, PlayerActionType, TraitKey, TurnPhase } from "../types";
import { MiniChart } from "./MiniChart";

interface CompanyCardProps {
  company: CompanyState;
  positionValue: number;
  availableCapital: number;
  resources: { attention: number; credibility: number; patience: number; optionality: number };
  phase: TurnPhase;
  selected: boolean;
  actionUsed: boolean;
  onSelect: () => void;
  onAllocate: (value: number) => void;
  onAction: (type: PlayerActionType) => void;
}

export function CompanyCard({
  company,
  positionValue,
  availableCapital,
  resources,
  phase,
  selected,
  actionUsed,
  onSelect,
  onAllocate,
  onAction,
}: CompanyCardProps) {
  const archetype = archetypeMap[company.archetype];
  const move = company.recentChange * 100;
  const allTraits = Object.keys(company.traits) as TraitKey[];
  const hiddenCount = allTraits.length - company.revealedTraits.length;
  const hiddenTrait = nextHiddenTrait(company);
  const maxPosition = positionValue + availableCapital;
  const commitment = positionValue > 0 ? Math.round(positionValue) : 0;

  return (
    <article
      className={`company-card collectible-card ${selected ? "selected" : ""} ${positionValue > 0 ? "owned" : ""}`}
      onClick={onSelect}
      style={{ "--company-accent": archetype.color } as React.CSSProperties}
    >
      <div className="card-rarity-line">
        <span>{archetype.label}</span>
        <span>{company.role}</span>
      </div>

      <div className="company-topline">
        <div className="company-symbol"><span>{company.name.slice(0, 2)}</span></div>
        <div className="company-name">
          <h3>{company.name}</h3>
          <span>{company.tagline}</span>
        </div>
        <div className="company-price">
          <strong>{Math.round(company.price * 4)}</strong>
          <span className={move >= 0 ? "gain" : "loss"}>
            {move >= 0 ? "+" : ""}{move.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="card-art">
        <div className="strata strata-one" />
        <div className="strata strata-two" />
        <span>{company.commodity.slice(0, 1)}</span>
        <MiniChart values={company.history} />
      </div>

      <div className="ownership-strip">
        <span>Your commitment <b>{commitment ? `${commitment} capital` : "Uncommitted"}</b></span>
        <span>Hype <b>{company.traits.marketHype}/10</b></span>
        <span>Risk <b className={`risk-${riskLevel(company).toLowerCase()}`}>{riskLevel(company)}</b></span>
      </div>

      <div className="character-read">
        <p><span>Wants</span>{company.desire}</p>
        <p><span>Flaw</span>{company.flaw}</p>
      </div>

      <div className="trait-grid">
        {company.revealedTraits.slice(0, 5).map((key) => {
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
            <span>Hidden DNA</span>
            <strong>? × {hiddenCount}</strong>
          </div>
        )}
      </div>

      <div className="takeaway">
        <span>FIELD READ</span>
        <p>{investorTakeaway(company)}</p>
      </div>

      <div className="recent-change">
        <span>{company.lastChangeReason}</span>
        <b className={move >= 0 ? "gain" : "loss"}>{move ? `${move > 0 ? "+" : ""}${move.toFixed(1)}%` : "Opening"}</b>
      </div>

      {selected && phase === "commit" && (
        <div className="allocation-panel" onClick={(event) => event.stopPropagation()}>
          <div className="allocation-label">
            <span>Set commitment</span>
            <strong>{Math.round(positionValue)} capital</strong>
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
            <button type="button" onClick={() => onAllocate(Math.max(0, positionValue - 100))}>Trim 100</button>
            <button type="button" onClick={() => onAllocate(Math.min(maxPosition, positionValue + 100))}>Pledge 100</button>
            <button type="button" onClick={() => onAllocate(Math.min(maxPosition, positionValue + 250))}>Pledge 250</button>
            <button type="button" onClick={() => onAllocate(0)}>Abandon</button>
          </div>
        </div>
      )}

      {selected && phase === "choose" && (
        <div className="action-panel" onClick={(event) => event.stopPropagation()}>
          <p>Choose your one power for this turn.</p>
          <div className="card-actions">
            <button disabled={actionUsed || !hiddenTrait || resources.attention < 2} onClick={() => onAction("investigate")}>
              <b>◎ Investigate</b>
              <span>2 Attention · reveal {hiddenTrait ? traitMap[hiddenTrait].label : "instinct"}</span>
            </button>
            <button disabled={actionUsed || resources.credibility < 2} onClick={() => onAction("credibility")}>
              <b>◆ Trusted Favor</b>
              <span>2 Credibility · open a backchannel</span>
            </button>
            <button disabled={actionUsed || resources.patience < 2 || positionValue <= 0} onClick={() => onAction("patience")}>
              <b>◴ Hold Conviction</b>
              <span>2 Patience · cushion downside</span>
            </button>
            <button disabled={actionUsed || resources.optionality < 2} onClick={() => onAction("optionality")}>
              <b>✦ Asymmetric Bet</b>
              <span>2 Optionality · amplify outcome</span>
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
