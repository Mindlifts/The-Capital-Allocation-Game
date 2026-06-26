"use client";

import { useEffect, useRef, useState } from "react";

export function WarRoomAudio({ cue }: { cue: string }) {
  const [enabled, setEnabled] = useState(false);
  const contextRef = useRef<AudioContext | null>(null);

  const tone = (frequency: number, duration = 0.07, volume = 0.025) => {
    if (!enabled) return;
    const AudioContextClass = window.AudioContext;
    const context = contextRef.current ?? new AudioContextClass();
    contextRef.current = context;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    gain.gain.setValueAtTime(volume, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  };

  useEffect(() => {
    if (!enabled) return;
    const frequency = cue.includes("world") ? 150 : cue.includes("draft") ? 520 : 310;
    tone(frequency, 0.16, 0.035);
    // cue intentionally triggers a restrained UI sting when the scene changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cue, enabled]);

  useEffect(() => {
    const handlePress = (event: MouseEvent) => {
      if ((event.target as HTMLElement).closest("button")) tone(420);
    };
    document.addEventListener("click", handlePress);
    return () => document.removeEventListener("click", handlePress);
  });

  return (
    <button
      type="button"
      className={`sound-control ${enabled ? "sound-on" : ""}`}
      onClick={() => setEnabled((value) => !value)}
      aria-label={`${enabled ? "Disable" : "Enable"} interface sound`}
      title="Interface sound"
    >
      <span className="sound-bars" aria-hidden="true"><i /><i /><i /></span>
      <b>{enabled ? "Sound on" : "Sound off"}</b>
    </button>
  );
}
