"use client";

import { useCallback, useEffect, useState } from "react";
import FutureSection from "./FutureSection";
import HeroSection from "./HeroSection";
import MilestoneSection from "./MilestoneSection";
import ProgressRail, { SiteHeader } from "./ProgressRail";
import TimelineSection from "./TimelineSection";
import { Starfield, useReducedMotion } from "./effects";
import type { AnniversaryContent } from "./data";


export default function AnniversaryExperience({ content }: { content: AnniversaryContent }) {
  const [activeId, setActiveId] = useState("opening");
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const sectionIds = ["opening", ...content.timelineEntries.map((entry) => entry.id), "future"];
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
  }, [content.timelineEntries]);

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
    const firstPage = document.getElementById("first-page");
    firstPage?.querySelector("h2")?.focus({ preventScroll: true });
    firstPage?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }, [reducedMotion]);

  return (
    <main className="anniversary-page" onDragStartCapture={(event) => {
      const target = event.target;
      if (target instanceof Element && target.closest("img, a:has(img)")) event.preventDefault();
    }}>
      <Starfield />
      <ProgressRail activeId={activeId} entries={content.timelineEntries} />
      <SiteHeader />
      <HeroSection reducedMotion={reducedMotion} onOpen={openLetter} dates={content.anniversaryDates} />
      <TimelineSection content={content} />
      <MilestoneSection reducedMotion={reducedMotion} content={content} />
      <FutureSection reducedMotion={reducedMotion} entries={content.futureEntries} />
    </main>
  );
}
