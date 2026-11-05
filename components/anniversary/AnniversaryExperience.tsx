"use client";

import { useCallback, useEffect, useState } from "react";
import FutureSection from "./FutureSection";
import HeroSection from "./HeroSection";
import MilestoneSection from "./MilestoneSection";
import ProgressRail, { SiteHeader } from "./ProgressRail";
import TimelineSection from "./TimelineSection";
import { Starfield, useReducedMotion } from "./effects";
import { timelineEntries } from "./data";

const sectionIds = ["opening", ...timelineEntries.map((entry) => entry.id), "future"];

export default function AnniversaryExperience() {
  const [activeId, setActiveId] = useState("opening");
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));
    let frame = 0;
    const update = () => {
      frame = 0;
      const readingLine = window.innerHeight * 0.42;
      let current = sections[0]?.id ?? "opening";
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= readingLine) current = section.id;
        else break;
      }
      setActiveId(current);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  useEffect(() => {
    const onPlay = (event: Event) => {
      for (const media of document.querySelectorAll<HTMLMediaElement>("audio, video")) {
        if (media !== event.target && !media.paused) media.pause();
      }
    };
    document.addEventListener("play", onPlay, true);
    return () => document.removeEventListener("play", onPlay, true);
  }, []);

  // Hero owns the opening animation; scrolling begins only after that sequence ends.
  const openLetter = useCallback(() => {
    document.getElementById("first-page")?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }, [reducedMotion]);

  return (
    <main className="anniversary-page">
      <Starfield />
      <ProgressRail activeId={activeId} />
      <SiteHeader />
      <HeroSection reducedMotion={reducedMotion} onOpen={openLetter} />
      <TimelineSection />
      <MilestoneSection reducedMotion={reducedMotion} />
      <FutureSection reducedMotion={reducedMotion} />
    </main>
  );
}
