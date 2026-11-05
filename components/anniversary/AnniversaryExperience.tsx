"use client";

import { useEffect, useMemo, useState } from "react";
import FutureSection from "./FutureSection";
import HeroSection from "./HeroSection";
import ProgressRail, { SiteHeader } from "./ProgressRail";
import TimelineSection from "./TimelineSection";
import { Starfield, useReducedMotion } from "./effects";
import { timelineEntries } from "./data";

const sectionIds = [
  "opening",
  ...timelineEntries.map((entry) => entry.id),
  "future",
];

export default function AnniversaryExperience() {
  const [activeId, setActiveId] = useState("opening");
  const reducedMotion = useReducedMotion();
  const ids = useMemo(() => sectionIds, []);

  useEffect(() => {
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveId(visible.target.id);
      },
      { threshold: [0.12, 0.35, 0.6], rootMargin: "-20% 0px -55%" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [ids]);

  const openLetter = () => {
    window.setTimeout(() => {
      document.getElementById("first-page")?.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });
    }, reducedMotion ? 0 : 420);
  };

  return (
    <main className="anniversary-page">
      <Starfield />
      <div className="ann-noise" aria-hidden="true" />
      <div className="ann-ambient ann-ambient-one" aria-hidden="true" />
      <div className="ann-ambient ann-ambient-two" aria-hidden="true" />
      <ProgressRail activeId={activeId} />
      <SiteHeader />
      <HeroSection reducedMotion={reducedMotion} onOpen={openLetter} />
      <TimelineSection />
      <FutureSection reducedMotion={reducedMotion} />
    </main>
  );
}
