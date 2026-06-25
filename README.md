# Capital Allocation Game

A fictional investing strategy game about allocating more than money. Build a
portfolio, investigate hidden company DNA, react to market events, and discover
your investing style across a compact ten-turn campaign.

No real companies, tickers, market data, or investment advice are used.

Each turn follows a clear five-step loop:

1. Review market changes.
2. Allocate or rebalance capital.
3. Choose one scarce-resource action.
4. Resolve a cinematic market event.
5. Read the portfolio impact and lesson hint.

Runs randomize trait values, hidden-trait order, and event sequences while
preserving the same fictional company universe.

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

Game data lives in `game/config`, simulation logic in `game/engine.ts`, and the
route UI in `app/capital-game`.
