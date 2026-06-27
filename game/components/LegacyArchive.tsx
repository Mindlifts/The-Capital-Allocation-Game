import type { PlayerMemory } from "../memory";
import { RunArtifact } from "./RunArtifact";

export function LegacyArchive({ memory, onClose }: { memory: PlayerMemory; onClose: () => void }) {
  return (
    <main className="legacy-archive">
      <div className="archive-halo" aria-hidden="true" />
      <nav><button type="button" className="text-button" onClick={onClose}>← Return</button><span>THE LEGACY ARCHIVE</span><b>{memory.runs.length} ARTIFACTS</b></nav>
      <header className="archive-heading">
        <span className="eyebrow">EVERY RUN LEAVES AN OBJECT BEHIND</span>
        <h1>Your past philosophies<br />are still watching.</h1>
        <p>Successes become instincts. Mistakes become warnings. Nothing completed here disappears.</p>
      </header>
      {memory.runs.length ? <section className="artifact-grid">{memory.runs.map((run, index) => <RunArtifact artifact={run} featured={index === 0} key={run.runId} />)}</section> : <section className="empty-archive"><span>◇</span><h2>No artifacts yet.</h2><p>Complete one run and the archive will remember who you became.</p></section>}
    </main>
  );
}
