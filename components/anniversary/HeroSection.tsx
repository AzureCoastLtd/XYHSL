"use client";

import { useEffect, useRef, useState } from "react";
import BlurText from "../reactbits/BlurText";
import { LightAtmosphere } from "./Atmosphere";
import type { AnniversaryContent } from "./data";
import "./hero.css";

export default function HeroSection({
  reducedMotion,
  onOpen,
  dates,
}: {
  reducedMotion: boolean;
  onOpen: () => void;
  dates: AnniversaryContent["anniversaryDates"];
}) {
  const [phase, setPhase] = useState<"closed" | "opening" | "open">("closed");
  const [canAnimateText, setCanAnimateText] = useState(false);
  const hasOpened = useRef(false);
  const openingTimer = useRef<number | null>(null);
  const onOpenRef = useRef(onOpen);
  const isOpen = phase !== "closed";

  useEffect(() => {
    onOpenRef.current = onOpen;
  }, [onOpen]);

  useEffect(() => {
    setCanAnimateText(!reducedMotion);
    if (reducedMotion && openingTimer.current !== null) {
      window.clearTimeout(openingTimer.current);
      openingTimer.current = null;
      setPhase("open");
      onOpenRef.current();
    }
  }, [reducedMotion]);

  useEffect(() => () => {
    if (openingTimer.current !== null) window.clearTimeout(openingTimer.current);
  }, []);

  const handleOpen = () => {
    if (hasOpened.current) return;
    hasOpened.current = true;
    setPhase(reducedMotion ? "open" : "opening");

    if (reducedMotion) {
      onOpenRef.current();
      return;
    }

    openingTimer.current = window.setTimeout(() => {
      openingTimer.current = null;
      setPhase("open");
      onOpenRef.current();
    }, 900);
  };

  return (
    <section
      id="opening"
      className="ann-hero"
      aria-labelledby="ann-hero-title"
      data-reduced-motion={reducedMotion ? "true" : "false"}
    >
      <div className="ann-hero-light" aria-hidden="true">
        <LightAtmosphere />
      </div>
      <div className="ann-hero-inner">
        <div className="ann-hero-copy">
          <p className="ann-hero-date">
            <time dateTime={dates.milestone.replaceAll(".", "-")}>{dates.milestone}</time>
            <span aria-hidden="true">·</span>
            <span>第 <strong>1000</strong> 天</span>
          </p>
          <h1 id="ann-hero-title" className="ann-hero-title">
            <span className="ann-hero-title-line">宝宝，</span>
            <span className="ann-hero-title-line ann-hero-title-love">
              {canAnimateText && !reducedMotion ? (
                <BlurText
                  text="见字如面。"
                  className="ann-hero-blur"
                  animateBy="letters"
                  direction="bottom"
                  delay={42}
                  stepDuration={0.24}
                  blur={5}
                  distance={12}
                  trigger="load"
                />
              ) : "见字如面。"}
            </span>
          </h1>
          <p className="ann-hero-subtitle">
            <span>这封信写在纸上，</span>
            <span>而我们的故事藏在这里。</span>
          </p>
          <p className="ann-hero-dedication">
            <span aria-hidden="true" />
            从第一天，到每一个明天。
          </p>
        </div>

        <div className="ann-hero-object" data-phase={phase}>
          <div className="ann-hero-orbit" aria-hidden="true" />
          <p className="ann-hero-handnote" aria-hidden="true">好好收藏，我们的第 1000 天</p>
          <button
            type="button"
            className={`ann-hero-envelope${isOpen ? " is-open" : ""}`}
            onClick={handleOpen}
            aria-expanded={isOpen}
            aria-disabled={isOpen}
            aria-controls="first-page"
            aria-describedby="ann-hero-open-hint"
            aria-label={phase === "closed" ? "打开写给宝宝的信" : phase === "opening" ? "信正在展开" : "信已打开"}
          >
            <span className="ann-hero-envelope-shadow" aria-hidden="true" />
            <span className="ann-hero-envelope-back" aria-hidden="true" />
            <span className="ann-hero-envelope-paper" aria-hidden="true">
              <span className="ann-hero-paper-to">亲爱的宝宝：</span>
              <span className="ann-hero-paper-number">1000</span>
              <span className="ann-hero-paper-note">是我们，也是新的开始。</span>
            </span>
            <span className="ann-hero-envelope-pocket" aria-hidden="true" />
            <svg className="ann-hero-envelope-creases" viewBox="0 0 300 200" preserveAspectRatio="none" fill="none" aria-hidden="true">
              <path d="M0 200 150 108 300 200M0 0 150 110 300 0" />
            </svg>
            <span className="ann-hero-envelope-address" aria-hidden="true">
              <span>To</span> 宝宝
            </span>
            <span className="ann-hero-envelope-stamp" aria-hidden="true">
              <span>1000</span>
              <span>DAYS</span>
            </span>
            <span className="ann-hero-envelope-flap" aria-hidden="true">
              <svg viewBox="0 0 300 124" preserveAspectRatio="none" fill="none">
                <path d="M1 1 150 122 299 1" />
              </svg>
              <span>只给你 · 亲启</span>
            </span>
            <span className="ann-hero-envelope-seal" aria-hidden="true">∞</span>
          </button>
          <div className="ann-hero-action">
            <a
              href="#first-page"
              className="ann-hero-open-link"
              onClick={(event) => {
                if (phase === "open") return;
                event.preventDefault();
                handleOpen();
              }}
            >
              <span>{phase === "closed" ? "打开这封信" : phase === "opening" ? "正在为你展开…" : "往下读，我们的故事"}</span>
              <span className="ann-hero-action-arrow" aria-hidden="true">↓</span>
            </a>
            <p id="ann-hero-open-hint" className="ann-hero-open-hint" role="status">
              {phase === "closed" ? "轻触信封，或继续向下阅读" : phase === "opening" ? "把这 1000 天，轻轻打开" : "信已展开，故事还在继续"}
            </p>
          </div>
        </div>
      </div>
      <div className="ann-hero-bottom" aria-hidden="true">
        <span>我们的第一个 1000 天</span>
        <span>{dates.start} — {dates.milestone}</span>
      </div>
    </section>
  );
}
