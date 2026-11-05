"use client";

import Link from "next/link";
import { timelineEntries } from "./data";

const progressEntries = [
  { id: "opening", label: "OPEN" },
  ...timelineEntries.map((entry) => ({ id: entry.id, label: entry.date })),
  { id: "future", label: "NEXT" },
];

export default function ProgressRail({ activeId }: { activeId: string }) {
  return (
    <nav className="ann-progress" aria-label="信件进度">
      <span className="ann-progress-line" aria-hidden="true" />
      {progressEntries.map((entry) => (
        <a
          key={entry.id}
          className={`ann-progress-item ${activeId === entry.id ? "is-active" : ""}`}
          href={`#${entry.id}`}
          aria-label={`跳转到 ${entry.label}`}
          aria-current={activeId === entry.id ? "step" : undefined}
        >
          <span className="ann-progress-dot" aria-hidden="true" />
          <span className="ann-progress-label">{entry.label}</span>
        </a>
      ))}
    </nav>
  );
}

export function SiteHeader() {
  return (
    <header className="ann-header">
      <Link href="/" className="ann-brand" aria-label="回到 1000 天首页">
        XYHSL <span>1000 DAYS</span>
      </Link>
      <Link href="/christmas" className="ann-header-link">
        旧礼物 <span aria-hidden="true">↗</span>
      </Link>
    </header>
  );
}
