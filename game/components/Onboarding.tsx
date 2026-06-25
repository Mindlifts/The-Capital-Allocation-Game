import { useState } from "react";

const lessons = [
  { icon: "◇", title: "Everything is scarce", body: "Capital buys positions. Attention, credibility, patience, and optionality buy different kinds of edge." },
  { icon: "?", title: "Company DNA is incomplete", body: "Visible traits shape your first read. Hidden traits reward research—or punish assumptions." },
  { icon: "↯", title: "Events change the world", body: "Every turn ends with uncertainty. Position size and company quality decide what survives." },
  { icon: "✦", title: "Build conviction", body: "Review, allocate, choose one action, resolve the event, and learn. The cycle lasts 10 turns." },
];

export function Onboarding({ onDone }: { onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const lesson = lessons[index];
  return (
    <div className="onboarding-backdrop">
      <section className="onboarding-card">
        <button type="button" className="skip-tutorial" onClick={onDone}>Skip briefing</button>
        <span className="eyebrow">60-SECOND FIELD BRIEFING // {index + 1} OF {lessons.length}</span>
        <div className="briefing-icon">{lesson.icon}</div>
        <h2>{lesson.title}</h2>
        <p>{lesson.body}</p>
        <div className="briefing-dots">
          {lessons.map((_, dot) => <i className={dot <= index ? "active" : ""} key={dot} />)}
        </div>
        <button
          type="button"
          className="primary-button"
          onClick={() => index === lessons.length - 1 ? onDone() : setIndex(index + 1)}
        >
          {index === lessons.length - 1 ? "Enter the market" : "Next principle"} <span>→</span>
        </button>
      </section>
    </div>
  );
}
