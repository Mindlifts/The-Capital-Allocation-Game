import type { CSSProperties } from "react";
import type { InvestorCard } from "../types";

const rarityOrder: Record<InvestorCard["rarity"], number> = {
  Common: 1,
  Rare: 2,
  Epic: 3,
  Legendary: 4,
};

export function InvestorDraft({
  turn,
  offer,
  deckSize,
  onDraft,
}: {
  turn: number;
  offer: InvestorCard[];
  deckSize: number;
  onDraft: (cardId: string) => void;
}) {
  const sorted = [...offer].sort((a, b) => rarityOrder[b.rarity] - rarityOrder[a.rarity]);
  return (
    <div className="draft-backdrop">
      <section className="draft-modal">
        <span className="eyebrow">INVESTOR CARD DRAFT // TURN {turn}</span>
        <h2>Choose a mental model.</h2>
        <p className="draft-lead">
          Cards remain active until the end. Your deck becomes your philosophy.
          Pick the model you want shaping every decision from here.
        </p>
        <div className="draft-grid">
          {sorted.map((card, index) => (
            <button
              type="button"
              className={`investor-card investor-${card.rarity.toLowerCase()}`}
              key={card.id}
              onClick={() => onDraft(card.id)}
              style={{ "--reveal-order": index } as CSSProperties}
            >
              <div className="investor-card-top">
                <span>{card.icon}</span>
                <i>{card.rarity}</i>
              </div>
              <div className="investor-portrait" aria-hidden="true">
                <div className="portrait-halo" />
                <span>{card.icon}</span>
              </div>
              {card.rarity === "Legendary" && <div className="legendary-ribbon">Legendary discovery</div>}
              {card.rarity === "Epic" && <div className="legendary-ribbon epic-ribbon">Epic mental model</div>}
              <h3>{card.title}</h3>
              <p className="card-lore">{card.shortLore}</p>
              <div className="card-rule">
                <span>PASSIVE</span>
                <p>{card.passiveAbility}</p>
              </div>
              <div className="card-rule drawback">
                <span>DRAWBACK</span>
                <p>{card.drawback}</p>
              </div>
              <div className="card-synergies">
                {card.synergies.map((synergy) => <em key={synergy}>{synergy}</em>)}
              </div>
            </button>
          ))}
        </div>
        <p className="draft-footer">Active cards after this pick: {deckSize + 1}</p>
      </section>
    </div>
  );
}
