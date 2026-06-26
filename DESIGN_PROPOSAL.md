# Capital Allocation Game: Roguelike Pivot Proposal

## North star

This project should become a short strategy roguelike about judgment under uncertainty. The player is not optimizing a portfolio. The player is forming an investment philosophy through imperfect reads, scarce resources, character-like companies, world events, regret, and adaptation.

The game should feel closer to a card battler plus civilization map than a finance dashboard. Capital remains one resource, but wisdom is the real progression.

## What should stay

- The `/capital-game` route. It already gives the project a focused playable surface.
- The clean separation between route UI, reusable components, config data, and `game/engine.ts`.
- The ten-turn run length. It creates urgency and makes replay realistic.
- Fictional companies, hidden traits, archetypes, philosophies, and events. These are the strongest existing primitives.
- The one-action-per-turn structure. It creates the right tactical constraint.
- Deterministic seeded randomness. It supports debugging while preserving replayability.
- The premium dark strategy-game visual direction.

## What should change

- Companies should be presented as characters, not securities. Their traits should read like motives, flaws, and latent powers.
- Holdings should become commitments. The player is committing scarce capital and reputation to a thesis, not buying a ticker.
- Price should become only one visible consequence. The player also watches wisdom, conviction, doctrine alignment, regret, and resilience.
- Events should be renamed and framed as the world's response. They should test the player's philosophy, not merely move asset prices.
- The final report should emphasize the philosophy the player actually built, with wealth as one score among several.
- UI copy should stop sounding like a terminal for investors and start sounding like a command room for uncertain decisions.

## Systems to introduce

### 1. Wisdom score

Wisdom should increase when the player investigates before committing, holds a well-supported thesis through noise, adapts after new evidence, or survives uncertainty without overreacting.

Wisdom should fall or stagnate when the player repeatedly chases hype, commits blindly, panics after predictable volatility, or overuses optionality.

### 2. Commitment model

Current positions can be kept internally, but the player-facing model should be:

- pledge capital;
- increase commitment;
- trim commitment;
- abandon thesis;
- hold conviction.

This reframes the game around decisions rather than securities.

### 3. Company character sheet

Each company card should show:

- name;
- archetype/role;
- current fate;
- player commitment;
- visible instincts;
- hidden instincts;
- hype pressure;
- danger level;
- read of the character;
- recent wound or breakthrough.

### 4. Doctrine pressure

Philosophies should act like powers. Each one should create:

- a starting resource profile;
- a preferred kind of company character;
- a bonus when the player behaves consistently;
- a failure mode when the player overextends the doctrine.

### 5. Regret and adaptation memory

The engine should track behavior across the run and use it in the end-game report. This already partly exists as `BehaviorStats`; it should become a first-class player identity system.

### 6. World response cards

Events should be presented as dramatic tests:

- what happened;
- who was tested;
- what trait changed;
- how commitments changed;
- what wisdom was gained or lost;
- why the moment matters.

## What should be removed or reduced

- Real-finance vocabulary that pulls the fantasy back toward Yahoo Finance: tickers, portfolio-first framing, market board language, target-price jokes, and overemphasis on return.
- Dashboard labels that imply spreadsheet optimization.
- Any future path that adds real market data, real company references, or real advice.
- The idea that a good run is only a high final value. A good run can also be disciplined, curious, resilient, adaptive, or strategically coherent.

## Refactor direction

The first refactor should be evolutionary rather than a rewrite:

1. Preserve the file structure and existing game loop.
2. Add wisdom scoring and player-facing terminology.
3. Reframe cards, events, onboarding, resources, and final screen.
4. Keep numeric capital mechanics for MVP playability.
5. Gradually rename deeper internal types in later passes once the new game identity stabilizes.

This keeps the prototype playable while moving the design center from investing simulator to strategy roguelike.
