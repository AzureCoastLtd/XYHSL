"use client";

import { type TimelineMedia, timelineEntries } from "./data";
import { BlurReveal, Reveal } from "./effects";
import { renderMedia } from "./media";

function TimelineEntryCard({ entry }: { entry: (typeof timelineEntries)[number] }) {
  const inlineMedia =
    entry.media?.filter((media) => media.type === "sticker" || media.type === "ambient") ?? [];
  const stackedMedia =
    entry.media?.filter((media) => media.type !== "sticker" && media.type !== "ambient") ?? [];
  const mediaIndex = (media: TimelineMedia) => entry.media?.indexOf(media) ?? 0;

  return (
    <article id={entry.id} className={`ann-entry ann-entry-${entry.tone}`}>
      <div className="ann-entry-node" aria-hidden="true"><span /></div>
      <div className="ann-entry-date">
        <span>{entry.date}</span>
        <i />
      </div>
      <Reveal className="ann-entry-content">
        <span className="ann-kicker">{entry.label}</span>
        <h2><BlurReveal text={entry.title} /></h2>
        <p>{entry.description}</p>
        {inlineMedia.length ? (
          <div className="ann-memory-tools">
            {inlineMedia.map((media) => renderMedia(media, mediaIndex(media)))}
          </div>
        ) : null}
        {stackedMedia.length ? (
          <div className="ann-letter-tools">
            {stackedMedia.map((media) => renderMedia(media, mediaIndex(media)))}
          </div>
        ) : null}
      </Reveal>
    </article>
  );
}

export default function TimelineSection() {
  return (
    <div className="ann-timeline">
      <div className="ann-timeline-line" aria-hidden="true" />
      {timelineEntries.map((entry) => (
        <TimelineEntryCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
