"use client";

import { useMemo } from "react";
import AmbientSound from "./AmbientSound";
import type { TimelineEntry } from "./data";


export default function ProgressRail({ activeId, entries }: { activeId: string; entries: TimelineEntry[] }) {
  const progressEntries = useMemo(() => [
    ...entries.map((entry) => ({ id: entry.id, label: entry.navLabel || entry.date })),
    { id: "future", label: "未完待续" },
  ], [entries]);
  const activeIndex = Math.max(0, progressEntries.findIndex((entry) => entry.id === activeId));

  return (
    <nav className="ann-progress" aria-label="信件章节导航">
      <div className="ann-progress-current" aria-live="polite" aria-atomic="true">
        <strong>{progressEntries[activeIndex].label}</strong>
        <span>{String(activeIndex + 1).padStart(2, "0")} / {String(progressEntries.length).padStart(2, "0")}</span>
      </div>
      <div className="ann-progress-links">
        {progressEntries.map((entry, index) => (
          <a
            key={entry.id}
            className={`ann-progress-item ${index === activeIndex ? "is-active" : ""} ${index < activeIndex ? "is-past" : ""}`}
            href={`#${entry.id}`}
            aria-label={`跳转至${entry.label}`}
            aria-current={index === activeIndex ? "step" : undefined}
          >
            <span className="ann-progress-label">{entry.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}

export function SiteHeader() {
  return (
    <header className="ann-header">
      <a href="#opening" className="ann-brand" aria-label="回到信封">
        <span className="ann-brand-mark" aria-hidden="true">∞</span>
        <span>一封，只写给你的信</span>
      </a>
      <AmbientSound />
    </header>
  );
}
