import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";

export type TimelineTone = "memory" | "milestone";

export type PhotoEntry = {
  src: string;
  previewSrc?: string;
  alt: string;
  caption: string;
  width?: number;
  height?: number;
};

export type TimelineMedia =
  | { type: "date"; id?: string; date: string; caption: string }
  | { type: "photos"; id?: string; items?: PhotoEntry[]; gallery?: boolean; title?: string; note?: string }
  | { type: "sticker"; id?: string; label: string; caption: string; memory?: string; image: PhotoEntry; audio?: { src: string; title: string } }
  | { type: "print"; id?: string; photo: PhotoEntry; title?: string; note?: string; expandable?: boolean }
  | { type: "letter"; id?: string };

export type TimelineMoment = {
  id: string;
  date: string;
  title: string;
  description: string;
  media?: TimelineMedia[];
};

export type TimelineEntry = {
  id: string;
  date: string;
  navLabel?: string;
  label: string;
  title: string;
  titleLines?: string[];
  description: string;
  tone: TimelineTone;
  media?: TimelineMedia[];
  moments?: TimelineMoment[];
};

export type FutureEntry = {
  id: string;
  index: string;
  title: string;
  description: string;
};

export type AnniversaryContent = {
  timelineEntries: TimelineEntry[];
  futureEntries: FutureEntry[];
  photoEntries: PhotoEntry[];
  letterContent: { greeting: string; paragraphs: string[]; sign: string; date: string };
  anniversaryDates: { start: string; startLabel: string; milestone: string; milestoneLabel: string };
};

export async function getAnniversaryContent(): Promise<AnniversaryContent> {
  return JSON.parse(await readFile(join(process.cwd(), ".private", "content.json"), "utf8")) as AnniversaryContent;
}
