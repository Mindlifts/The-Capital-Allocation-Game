import type { GameState, ResourceKey } from "../types";

const resourceMeta: Array<{
  key: ResourceKey;
  label: string;
  icon: "coin" | "eye" | "shield" | "hourglass" | "spark";
}> = [
  { key: "capital", label: "Capital", icon: "coin" },
  { key: "attention", label: "Attention", icon: "eye" },
  { key: "credibility", label: "Credibility", icon: "shield" },
  { key: "patience", label: "Patience", icon: "hourglass" },
  { key: "optionality", label: "Optionality", icon: "spark" },
];

function ResourceIcon({ icon }: { icon: typeof resourceMeta[number]["icon"] }) {
  const paths = {
    coin: <><circle cx="12" cy="12" r="7.5" /><path d="M9.5 10.2c0-1.1 1-1.9 2.5-1.9s2.5.7 2.5 1.8c0 2.8-5 1.1-5 3.8 0 1.1 1 1.8 2.6 1.8s2.7-.8 2.7-1.9M12 6.5v11" /></>,
    eye: <><path d="M3.2 12s3.1-5 8.8-5 8.8 5 8.8 5-3.1 5-8.8 5-8.8-5-8.8-5Z" /><circle cx="12" cy="12" r="2.3" /></>,
    shield: <path d="M12 3.3 19 6v5.1c0 4.3-2.7 7.5-7 9.6-4.3-2.1-7-5.3-7-9.6V6l7-2.7Zm-3 8.6 2 2 4.2-4.2" />,
    hourglass: <path d="M7 3.5h10M7 20.5h10M8 4c0 4.3 1.3 6.2 4 8-2.7 1.8-4 3.7-4 8m8-16c0 4.3-1.3 6.2-4 8 2.7 1.8 4 3.7 4 8" />,
    spark: <path d="m12 2.8 1.7 5.5 5.5 1.7-5.5 1.7-1.7 5.5-1.7-5.5L4.8 10l5.5-1.7L12 2.8Zm6 13 .7 2.2 2.2.7-2.2.7-.7 2.2-.7-2.2-2.2-.7 2.2-.7.7-2.2Z" />,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">{paths[icon]}</svg>;
}

export function ResourceBar({ state }: { state: GameState }) {
  return (
    <div className="resource-bar">
      {resourceMeta.map((resource) => {
        const value = state.resources[resource.key];
        return (
          <div className="resource" key={resource.key}>
            <span className="resource-icon"><ResourceIcon icon={resource.icon} /></span>
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
