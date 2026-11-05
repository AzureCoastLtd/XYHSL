"use client";

import { type TimelineEntry, timelineEntries } from "./data";
import { renderMedia } from "./media";
import "./timeline.css";

function TimelineEntryCard({ entry, index }: { entry: TimelineEntry; index: number }) {
  const hasMedia = Boolean(entry.media?.length);
  const isDate = /^\d{4}\.\d{2}\.\d{2}$/.test(entry.date);

  return (
    <article
      id={entry.id}
      className={`ann-entry${hasMedia ? "" : " ann-entry-text-only"}`}
      data-media={entry.media?.some((media) => media.type === "photos") ? "photos" : undefined}
      aria-labelledby={`${entry.id}-title`}
    >
      <div className="ann-entry-content">
        <div className="ann-entry-meta">
          <span className="ann-memory-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
          <span className="ann-memory-label">{entry.label}</span>
          {isDate ? <time className="ann-entry-date" dateTime={entry.date.replaceAll(".", "-")}>{entry.date}</time> : <span className="ann-entry-date">{entry.date}</span>}
        </div>
        <h2 id={`${entry.id}-title`} aria-label={entry.title}>
          {(entry.titleLines?.length ? entry.titleLines : [entry.title]).map((line, lineIndex) => (
            <span className="ann-memory-title-line" key={`${line}-${lineIndex}`}>{line}</span>
          ))}
        </h2>
        <p className="ann-entry-description">{entry.description}</p>
        <span className="ann-memory-rule" aria-hidden="true" />
      </div>
      {hasMedia ? <div className="ann-entry-artifacts">{entry.media?.map((media, mediaIndex) => renderMedia(media, mediaIndex))}</div> : null}
    </article>
  );
}

export default function TimelineSection() {
  return (
    <section className="ann-timeline" aria-label="那些关于我们的事">
      <div className="ann-timeline-heading"><span>把小事，写成我们的故事</span><span aria-hidden="true">MEMORIES, KEPT CLOSE</span></div>
      {timelineEntries.filter((entry) => entry.tone !== "milestone").map((entry, index) => (
        <TimelineEntryCard key={entry.id} entry={entry} index={index} />
      ))}
    </section>
  );
}
