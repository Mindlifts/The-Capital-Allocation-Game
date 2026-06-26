import type { TurnPhase } from "../types";

const steps: Array<{ phase: TurnPhase; label: string; short: string }> = [
  { phase: "observe", label: "Observe", short: "Observe" },
  { phase: "think", label: "Think", short: "Think" },
  { phase: "choose", label: "Choose", short: "Choose" },
  { phase: "commit", label: "Commit", short: "Commit" },
  { phase: "world", label: "World Reacts", short: "World" },
  { phase: "reflect", label: "Reflect", short: "Reflect" },
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
