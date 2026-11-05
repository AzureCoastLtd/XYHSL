"use client";

import { useState } from "react";

export default function HeroSection({
  reducedMotion,
  onOpen,
}: {
  reducedMotion: boolean;
  onOpen: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    onOpen();
  };

  return (
    <section id="opening" className="ann-hero">
      <div className="ann-hero-orbit ann-hero-orbit-one" aria-hidden="true" />
      <div className="ann-hero-orbit ann-hero-orbit-two" aria-hidden="true" />
      <div className="ann-hero-copy">
        <span className="ann-kicker">A LETTER IN MOTION / 2026</span>
        <p className="ann-hero-count">01 <span>/</span> ∞</p>
        <h1>宝宝，<br /><em>打开这封信。</em></h1>
        <p className="ann-hero-subtitle">这封信写在纸上，而我们的故事藏在这里。</p>
      </div>
      <button
        type="button"
        className={`ann-envelope ${isOpen ? "is-open" : ""}`}
        onClick={handleOpen}
        aria-expanded={isOpen}
        aria-label={isOpen ? "信已打开" : "打开写给宝宝的信"}
        data-reduced-motion={reducedMotion ? "true" : "false"}
      >
        <span className="ann-envelope-shadow" aria-hidden="true" />
        <span className="ann-envelope-body" aria-hidden="true" />
        <span className="ann-envelope-flap" aria-hidden="true" />
        <span className="ann-envelope-paper" aria-hidden="true">
          <span>1000</span>
          <small>days</small>
        </span>
        <span className="ann-envelope-seal" aria-hidden="true">∞</span>
      </button>
      <div className="ann-hero-action">
        <span className="ann-scroll-line" aria-hidden="true" />
        <span>{isOpen ? "信已打开，向下阅读" : "点击打开，然后向下阅读"}</span>
      </div>
    </section>
  );
}
