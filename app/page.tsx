import Link from "next/link";

export default function Home() {
  return (
    <main className="home">
      <div className="home-card">
        <span className="eyebrow">NORTHSTAR GAMES // FIELD TEST 01</span>
        <h1>Capital Allocation Game</h1>
        <p>
          Build a philosophy. Survive uncertainty. Discover what kind of thinker
          you become when every resource is scarce.
        </p>
        <Link href="/capital-game" className="primary-button">
          Enter the doctrine room <span>→</span>
        </Link>
      </div>
    </main>
  );
}
