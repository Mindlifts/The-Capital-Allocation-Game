import type { TurnPhase } from "../types";

const steps: Array<{ phase: TurnPhase; label: string; short: string }> = [
  { phase: "review", label: "Review changes", short: "Review" },
  { phase: "allocate", label: "Allocate capital", short: "Allocate" },
  { phase: "action", label: "Choose one edge", short: "Action" },
  { phase: "event", label: "Resolve event", short: "Event" },
  { phase: "result", label: "Read impact", short: "Impact" },
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
