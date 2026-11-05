"use client";

import { useEffect, useRef, useState } from "react";
import { MilestoneAtmosphere } from "./Atmosphere";
import { timelineEntries } from "./data";
import { LetterCard } from "./media";
import "./milestone.css";

const milestone = timelineEntries.find((entry) => entry.tone === "milestone");

export default function MilestoneSection({ reducedMotion }: { reducedMotion: boolean }) {
  const numberRef = useRef<HTMLDivElement>(null);
  const [impression, setImpression] = useState("still");

  useEffect(() => {
    const number = numberRef.current;
    if (
      !number ||
      reducedMotion ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      setImpression("still");
      return;
    }

    setImpression("waiting");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setImpression("revealed");
        observer.disconnect();
      },
      { threshold: 0.45 },
    );
    observer.observe(number);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <section
      id="thousand"
      className="ann-milestone-section"
      aria-labelledby="ann-milestone-title"
      data-reduced-motion={reducedMotion || undefined}
    >
      <div className="ann-milestone-inner">
        <div className="ann-milestone-scene">
          <div className="ann-milestone-atmosphere" aria-hidden="true">
            <MilestoneAtmosphere />
          </div>
          <header className="ann-milestone-dateline">
            <span>写给宝宝的第 1000 天</span>
            <time dateTime="2026-11-18">2026.11.18</time>
          </header>

          <div className="ann-milestone-number-wrap">
            <div
              ref={numberRef}
              className="ann-milestone-number"
              data-impression={impression}
              aria-hidden="true"
            >
              <span className="ann-milestone-imprint">1000</span>
              <span className="ann-milestone-grain">1000</span>
              <span className="ann-milestone-foil">1000</span>
              <span className="ann-milestone-press-light" />
            </div>
            <p className="ann-milestone-count-caption">一天一天，走到这里。</p>
          </div>

          <div className="ann-milestone-intro">
            <span className="ann-milestone-label">{milestone?.label}</span>
            <h2 id="ann-milestone-title">每一天，<br />都算数。</h2>
            <p>从 2024 年 2 月 23 日的第一天，<br />到 2026 年 11 月 18 日，是我们的第 1000 天。</p>
          </div>
        </div>

        <div className="ann-milestone-letter-layout">
          <div className="ann-milestone-letter-aside">
            <span className="ann-milestone-letter-rule" aria-hidden="true" />
            <p className="ann-milestone-letter-caption">把一千天，折进一封信。</p>
            <p>有些话，想慢一点说。<br />有些心意，想让你一直留着。</p>
            <span className="ann-milestone-letter-number">给宝宝 · 第 1000 天纪念</span>
          </div>
          <div className="ann-milestone-letter-artifact">
            <LetterCard />
          </div>
        </div>
      </div>
    </section>
  );
}
