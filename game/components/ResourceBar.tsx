import type { GameState, ResourceKey } from "../types";

const resourceMeta: Array<{
  key: ResourceKey;
  label: string;
  icon: string;
}> = [
  { key: "capital", label: "Capital", icon: "$" },
  { key: "attention", label: "Attention", icon: "◎" },
  { key: "credibility", label: "Credibility", icon: "◆" },
  { key: "patience", label: "Patience", icon: "◴" },
  { key: "optionality", label: "Optionality", icon: "✦" },
];

export function ResourceBar({ state }: { state: GameState }) {
  return (
    <div className="resource-bar">
      {resourceMeta.map((resource) => {
        const value = state.resources[resource.key];
        return (
          <div className="resource" key={resource.key}>
            <span className="resource-icon">{resource.icon}</span>
            <span>
              <small>{resource.label}</small>
              <strong>
                {resource.key === "capital" ? Math.round(value).toLocaleString("en-US") : value.toFixed(value % 1 ? 1 : 0)}
              </strong>
            </span>
          </div>
        );
      })}
    </div>
  );
}
