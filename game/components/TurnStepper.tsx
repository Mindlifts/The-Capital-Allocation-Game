import type { TurnPhase } from "../types";

const steps: Array<{ phase: TurnPhase; label: string; short: string }> = [
  { phase: "review", label: "Read the world", short: "Read" },
  { phase: "allocate", label: "Commit capital", short: "Commit" },
  { phase: "action", label: "Use one power", short: "Power" },
  { phase: "event", label: "World responds", short: "World" },
  { phase: "result", label: "Gain wisdom", short: "Wisdom" },
];

export function TurnStepper({ phase }: { phase: TurnPhase }) {
  const current = Math.max(0, steps.findIndex((step) => step.phase === phase));
  return (
    <div className="turn-stepper">
      {steps.map((step, index) => (
        <div className={`${index === current ? "active" : ""} ${index < current ? "done" : ""}`} key={step.phase}>
          <i>{index < current ? "✓" : index + 1}</i>
          <span>{step.label}</span>
          <b>{step.short}</b>
        </div>
      ))}
    </div>
  );
}
