import type { EventKnowledge, GameEvent, TraitKey } from "../types";

const specificKnowledge: Record<string, EventKnowledge> = {
  "discovery-moment": {
    summary: "New technical evidence suggests the company’s core asset may be larger or better than previously believed.",
    cause: "Fresh results reduced one of the biggest unknowns in the company’s story.",
    consequence: "The market now assigns a higher probability to commercial success, but one result still does not prove the full project.",
    decisionPrompt: "Decide whether this evidence strengthens the original thesis—or whether excitement has moved faster than proof.",
  },
  "cycle-awakens": {
    summary: "Demand expectations improved across the entire resource sector, lifting companies with direct commodity exposure.",
    cause: "Buyers expect future supply to become more valuable relative to demand.",
    consequence: "Even weaker companies can rise during a cycle. Durable winners still need execution and funding.",
    decisionPrompt: "Separate companies benefiting from the tide from those capable of creating value after the cycle cools.",
  },
  "gates-close": {
    summary: "Negotiations with workers or local stakeholders stalled operations and pushed the timeline back.",
    cause: "The company underestimated the human agreements required to execute its plan.",
    consequence: "Delays consume cash and credibility. Strong management may recover; fragile companies may need financing.",
    decisionPrompt: "Ask whether this is a temporary dispute or evidence that management cannot deliver the plan.",
  },
  "runway-bought": {
    summary: "The company raised new money, improving its chance of survival but reducing every existing owner’s share of the upside.",
    cause: "Its current cash balance was not enough to fund the next stage alone.",
    consequence: "Bankruptcy risk falls, but dilution means future success is shared across more ownership units.",
    decisionPrompt: "Judge whether the new funding creates more value than the dilution removes.",
  },
  "architect-leaves": {
    summary: "A key leader left before the company completed its most difficult work.",
    cause: "The strategy depended heavily on one person’s knowledge, authority, or relationships.",
    consequence: "Execution becomes less predictable until a credible successor proves the organization is deeper than its founder.",
    decisionPrompt: "Decide whether you backed a durable organization or one exceptional individual.",
  },
  "titan-circles": {
    summary: "Rumors suggest a larger company may acquire or partner with this business.",
    cause: "The asset appears strategically useful to a better-funded operator.",
    consequence: "The price rises before facts arrive. If the rumor fails, that premium can disappear quickly.",
    decisionPrompt: "Would you still want to own the company if no takeover occurs?",
  },
  "map-refuses": {
    summary: "A permitting or political decision delayed the company’s ability to move forward.",
    cause: "The project requires public approval that management does not fully control.",
    consequence: "The asset may remain valuable, but time, financing needs, and political uncertainty all increase.",
    decisionPrompt: "Ask whether the potential reward is large enough to justify an unknowable timeline.",
  },
  "road-arrives": {
    summary: "New transport or utility infrastructure makes the company’s project cheaper and more practical to develop.",
    cause: "A bottleneck outside the company’s control has been removed.",
    consequence: "Construction risk and operating costs fall, improving the project’s chance of becoming economically viable.",
    decisionPrompt: "Determine how much of this improvement was already expected in the current valuation.",
  },
  "hype-bubble": {
    summary: "Attention surged across the market, pushing prices up faster than underlying businesses improved.",
    cause: "Investors began copying visible excitement instead of waiting for additional evidence.",
    consequence: "Momentum can continue, but disappointment becomes more expensive when expectations are this high.",
    decisionPrompt: "Choose whether to ride the crowd, reduce exposure, or demand stronger proof before paying more.",
  },
  "empty-chamber": {
    summary: "The company’s most important test failed to find enough economic value.",
    cause: "The underlying asset did not match expectations created by earlier signals.",
    consequence: "Future upside falls sharply, and the company may need a new project or new financing to remain relevant.",
    decisionPrompt: "Decide whether any credible thesis remains after the flagship assumption failed.",
  },
  "friction-tax": {
    summary: "Labor, materials, energy, and financing all became more expensive at the same time.",
    cause: "Industry-wide cost inflation raised the price of turning plans into operating assets.",
    consequence: "Companies with cash and pricing power can adapt; fragile companies may dilute owners or delay projects.",
    decisionPrompt: "Favor businesses that can fund the next step without depending on perfect conditions.",
  },
  "desert-transmission": {
    summary: "A new power connection reached a remote region and removed a major development bottleneck.",
    cause: "Shared infrastructure made previously isolated projects cheaper to build and operate.",
    consequence: "Projects in the corridor become more viable, although company-specific execution risk remains.",
    decisionPrompt: "Identify which company can convert regional improvement into actual operating progress.",
  },
  "procurement-freeze": {
    summary: "A public-sector customer paused new spending while budgets are reviewed.",
    cause: "Political priorities changed faster than company planning cycles.",
    consequence: "Expected revenue may arrive later or not at all, increasing cash-flow and financing pressure.",
    decisionPrompt: "Test whether the company has other customers or depends on one political budget.",
  },
  "model-breakthrough": {
    summary: "A difficult technical demonstration worked under realistic conditions.",
    cause: "The team solved an engineering problem that previously limited adoption.",
    consequence: "Commercial success becomes more plausible, but manufacturing, distribution, and customer demand still need proof.",
    decisionPrompt: "Reward technical progress without pretending the entire business model is now proven.",
  },
  "clinical-hold": {
    summary: "Regulators paused a medical trial while potential safety issues are reviewed.",
    cause: "New observations created uncertainty about whether the treatment’s benefits justify its risks.",
    consequence: "The timeline extends, costs rise, and the program may require changes before continuing.",
    decisionPrompt: "Decide whether the company has enough evidence and cash to survive a longer path.",
  },
};

const traitMeaning: Record<TraitKey, { positive: string; negative: string }> = {
  builderDna: { positive: "The organization became better at turning plans into durable assets.", negative: "The organization’s ability to build durable assets weakened." },
  geologicalLuck: { positive: "Evidence increased confidence in the quality of the underlying resource.", negative: "Evidence reduced confidence in the quality of the underlying resource." },
  balanceSheet: { positive: "The company gained more financial room to survive delays and fund growth.", negative: "The company has less financial room and may need to cut plans or raise money." },
  managementQuality: { positive: "Confidence in leadership and decision quality improved.", negative: "Leadership credibility and decision confidence deteriorated." },
  infrastructure: { positive: "The project became easier or cheaper to connect, build, and operate.", negative: "Logistical or physical bottlenecks became more severe." },
  politicalRisk: { positive: "Dependence on uncertain political decisions increased.", negative: "Political uncertainty eased and the path became more predictable." },
  marketHype: { positive: "Investor expectations rose, increasing both momentum and disappointment risk.", negative: "Excitement faded, lowering expectations and access to easy capital." },
  commodityExposure: { positive: "The company became more sensitive to favorable industry pricing.", negative: "The company lost some benefit from industry pricing or demand." },
  optionality: { positive: "The company gained another credible path to a much larger outcome.", negative: "One potential path to future upside became less credible." },
  executionSkill: { positive: "The team demonstrated a stronger ability to deliver difficult work.", negative: "The team’s ability to deliver on time and budget is now less certain." },
};

export function eventKnowledge(event: GameEvent): EventKnowledge {
  const known = specificKnowledge[event.id];
  if (known) return known;
  const primary = event.effects.find((effect) => effect.trait);
  const traitText = primary?.trait
    ? traitMeaning[primary.trait][(primary.traitDelta ?? 0) >= 0 ? "positive" : "negative"]
    : event.tone === "positive" ? "The probability of a favorable outcome improved." : "The probability of a favorable outcome declined.";
  return {
    summary: event.description,
    cause: event.narrative.replace("{company}", "The affected company"),
    consequence: traitText,
    decisionPrompt: event.tone === "positive"
      ? "Check whether the new evidence justifies the higher expectations before increasing commitment."
      : event.tone === "negative"
        ? "Decide whether the original thesis still survives and whether the remaining upside compensates for the new risk."
        : "Recalculate the tradeoff: survival may have improved even if ownership economics became less attractive.",
  };
}

export function plainEffectLines(event: GameEvent) {
  return event.effects.flatMap((effect) => {
    const lines: string[] = [];
    if (effect.priceDelta) lines.push(`Market value ${effect.priceDelta > 0 ? "rose" : "fell"} about ${Math.abs(Math.round(effect.priceDelta * 100))}% before company-specific factors.`);
    if (effect.trait && effect.traitDelta) lines.push(traitMeaning[effect.trait][effect.traitDelta >= 0 ? "positive" : "negative"]);
    if (effect.resource && effect.resourceDelta) lines.push(`${effect.resource} changed by ${effect.resourceDelta > 0 ? "+" : ""}${effect.resourceDelta}.`);
    return lines;
  });
}
