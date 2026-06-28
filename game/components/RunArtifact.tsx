import type { CompletedRunMemory } from "../memory";

export function RunArtifact({ artifact, featured = false }: { artifact: CompletedRunMemory; featured?: boolean }) {
  return (
    <article className={`run-artifact ${featured ? "artifact-featured" : ""}`}>
      <div className="artifact-corners" aria-hidden="true" />
      <header><span>RUN #{String(artifact.runId).slice(-4)}</span><i>{artifact.completedAt ? new Date(artifact.completedAt).toLocaleDateString() : "Legacy record"}</i></header>
      <div className="artifact-sigil">✦</div>
      <p className="artifact-philosophy">{artifact.philosophy}</p>
      <h2>{artifact.artifactTitle || artifact.philosophy}</h2>
      <div className="artifact-legacy"><span>LEGACY</span><strong>{artifact.legacyScore}</strong></div>
      <div className="artifact-fate"><span>{artifact.fateLabel || "REMEMBERED FOR"}</span><strong>{artifact.fate || artifact.greatestSuccess}</strong></div>
      <dl>
        <div><dt>Greatest decision</dt><dd>{artifact.greatestSuccess}</dd></div>
        <div><dt>Deepest regret</dt><dd>{artifact.biggestMistake}</dd></div>
      </dl>
      <blockquote>{artifact.legend || `${artifact.philosophy}. Legacy ${artifact.legacyScore}.`}</blockquote>
      <footer>
        <span>{artifact.rememberedCompanies?.slice(0, 3).join(" · ") || artifact.favoriteCompanyArchetype}</span>
        <small>{artifact.investorCards?.length ?? 0} mental models carried</small>
      </footer>
    </article>
  );
}
