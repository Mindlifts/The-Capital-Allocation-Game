# Capital Allocation Game

A fictional strategy roguelike about capital allocation under uncertainty.

The player is not trying to memorize finance or optimize a spreadsheet. The
player is building an investment philosophy through curiosity, incomplete
information, scarce resources, conviction, regret, discovery, and adaptation.

Companies are characters. Philosophies are powers. Events are the world's
response. Money is only one score; wisdom is the real progression.

No real companies, real tickers, market data, or investment advice are used.

## Current run loop

Each ten-turn run follows a clear rhythm:

1. Read the world.
2. Commit or rebalance capital.
3. Use one doctrine power.
4. Face a world response card.
5. Read the consequence and gain wisdom.

Runs randomize trait values, hidden-trait order, and event sequence while
preserving the fictional universe.

## Architecture

- `app/capital-game/page.tsx` contains the route-level game UI.
- `game/engine.ts` owns deterministic game state transitions.
- `game/types.ts` defines state, character, event, philosophy, and report types.
- `game/config` holds the fictional universe: companies, events, traits,
  archetypes, and philosophies.
- `game/components` holds reusable game UI components.
- `DESIGN_PROPOSAL.md` documents the roguelike pivot and the next design target.

## Run locally

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000/capital-game](http://localhost:3000/capital-game).

## Checks

```bash
pnpm typecheck
pnpm build
```
