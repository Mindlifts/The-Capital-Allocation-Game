# Capital Allocation Game — Contributor North Star

## Mandatory design rule

> Every new mechanic must make the player a better decision-maker, not just a richer virtual investor.

This is the highest-priority product constraint. Apply it before implementing, expanding, or preserving any gameplay system.

Before adding a mechanic, ask:

1. Does it deepen judgment under uncertainty?
2. Does it reveal a bias, tradeoff, consequence, or incomplete truth through play?
3. Does it strengthen curiosity, patience, adaptation, conviction, or the ability to change one’s mind?
4. Would the experience remain meaningful if money were removed from the score?
5. Will the player remember a decision or story—not merely a number?

If the answer is no, simplify, replace, or remove the mechanic.

## Guardrails

- Companies are characters, not datasets.
- Prefer stories over numbers and behavior over explanation.
- Hide the engine until understanding it becomes a discovery.
- Use persistent memory to make choices matter across turns and runs.
- Identity and wisdom are progression; money is only one consequence.
- Do not add content to compensate for a weak emotional loop.
- Do not turn the game into an investing simulator or financial dashboard.

## Implementation discipline

- Preserve the focused one-important-decision-at-a-time flow.
- Keep game logic separate from UI and fictional data in config modules.
- Keep persistence behind adapters so local storage can later become cloud sync.
- Verify changes with `pnpm typecheck` and `pnpm build`.
- Commit completed work to the active `codex/` branch and attempt to push it.
