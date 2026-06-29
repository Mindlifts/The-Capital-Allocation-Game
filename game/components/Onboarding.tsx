import { useState } from "react";

const lessons = [
  { icon: "◇", title: "Everything is scarce", body: "Capital matters, but so do Attention, Credibility, Patience, and Optionality. Each buys a different kind of decision power." },
  { icon: "◌", title: "One opportunity at a time", body: "Each round presents three companies one by one. Read the card, choose an action, then choose the reason." },
  { icon: "◎", title: "Research reveals hidden truth", body: "Companies have visible signals and unrevealed traits. Spend Attention when the missing information matters." },
  { icon: "↯", title: "The world responds", body: "After three decisions, an event card tests your memos. The lesson comes from why you chose, not only what happened." },
];

export function Onboarding({ onDone }: { onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const lesson = lessons[index];

  return (
    <div className="onboarding-backdrop" role="dialog" aria-modal="true" aria-label="Field briefing">
      <section className="onboarding-card" key={index}>
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
          {index === lessons.length - 1 ? "Enter the room" : "Next principle"} <span>→</span>
        </button>
      </section>
    </div>
  );
}
