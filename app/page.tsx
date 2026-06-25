import Link from "next/link";

export default function Home() {
  return (
    <main className="home">
      <div className="home-card">
        <span className="eyebrow">NORTHSTAR GAMES // FIELD TEST 01</span>
        <h1>Capital Allocation Game</h1>
        <p>
          Build conviction. Survive uncertainty. Discover what kind of investor
          you become when every resource is scarce.
        </p>
        <Link href="/capital-game" className="primary-button">
          Enter the allocation room <span>→</span>
        </Link>
      </div>
    </main>
  );
}
