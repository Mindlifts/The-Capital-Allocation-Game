# Capital Allocation Game

A fictional investing strategy game about allocating more than money. Build a
portfolio, investigate hidden company DNA, react to market events, and discover
your investing style across a compact ten-turn campaign.

No real companies, tickers, market data, or investment advice are used.

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
