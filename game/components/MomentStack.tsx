import type { DopamineMoment } from "../types";

const iconFor: Record<DopamineMoment["kind"], string> = {
  combo: "✦",
  legendary: "✹",
  "near-miss": "◌",
  critical: "!",
  "rare-event": "◆",
  opportunity: "◇",
  "risk-reward": "↯",
  discovery: "◎",
  "perfect-timing": "◴",
  unlock: "▣",
};

export function MomentStack({ moments }: { moments: DopamineMoment[] }) {
  if (!moments.length) return null;
  return (
    <div className="moment-stack">
      {moments.slice(0, 4).map((moment, index) => (
        <article className={`moment-card moment-${moment.tone}`} key={`${moment.kind}-${moment.title}-${index}`}>
          <span>{iconFor[moment.kind]}</span>
          <div>
            <small>{moment.kind.replace("-", " ")}</small>
            <strong>{moment.title}</strong>
            <p>{moment.body}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
