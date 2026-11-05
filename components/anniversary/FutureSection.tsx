"use client";

import Link from "next/link";
import { futureEntries } from "./data";
import { Reveal } from "./effects";

export default function FutureSection({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <section id="future" className="ann-future-section">
      <div className="ann-future-glow" aria-hidden="true" />
      <Reveal className="ann-future-intro">
        <span className="ann-kicker">THE STORY CONTINUES</span>
        <p className="ann-future-eyebrow">1000 DAYS / NOT THE END</p>
        <h2>下一页，<em>未完待续。</em></h2>
        <p>有些愿望不需要提前写上日期，只要它们还在我们的未来里。</p>
      </Reveal>
      <div className="ann-future-grid">
        {futureEntries.map((entry) => (
          <Reveal key={entry.id} className="ann-future-card">
            <span>{entry.index}</span>
            <h3>{entry.title}</h3>
            <p>{entry.description}</p>
            <i aria-hidden="true">···</i>
          </Reveal>
        ))}
      </div>
      <Reveal className="ann-final-note">
        <span className="ann-final-line" aria-hidden="true" />
        <p>这封信写在纸上，而我们的故事藏在这里。</p>
        <button
          type="button"
          onClick={() =>
            window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" })
          }
        >
          再看一遍 <span aria-hidden="true">↗</span>
        </button>
        <Link href="/christmas" className="ann-old-gift-link">
          还有一个旧礼物 <span aria-hidden="true">↗</span>
        </Link>
      </Reveal>
    </section>
  );
}
