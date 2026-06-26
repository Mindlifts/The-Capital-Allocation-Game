import { useState } from "react";

const lessons = [
  { icon: "◇", title: "Everything is scarce", body: "Capital matters, but so do Attention, Credibility, Patience, and Optionality. Each buys a different kind of decision power." },
  { icon: "?", title: "Companies are characters", body: "Each one has visible instincts and hidden instincts. You are reading motives, flaws, and potential under fog." },
  { icon: "↯", title: "The world responds", body: "Every turn ends with an event. The event tests what you believed, not just what you owned." },
  { icon: "✦", title: "Build a philosophy", body: "Read, commit, use one power, face the response, and adapt. Ten turns decide what kind of thinker you became." },
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
          {index === lessons.length - 1 ? "Enter the room" : "Next principle"} <span>→</span>
        </button>
      </section>
    </div>
  );
}
