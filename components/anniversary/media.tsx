"use client";

import dynamic from "next/dynamic";
import Image, { getImageProps } from "next/image";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { type PhotoEntry, type TimelineMedia, letterContent, photoEntries } from "./data";
import { useVisualMode } from "./effects";
import "./media.css";

const CircularGallery = dynamic(() => import("../reactbits/CircularGallery"), {
  ssr: false,
  loading: () => null,
});

export function PhotoDeck({ photos = photoEntries }: { photos?: PhotoEntry[] }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const trackId = useId();
  const { enhanced, reduced } = useVisualMode(frameRef);
  const [active, setActive] = useState(0);
  const [galleryReady, setGalleryReady] = useState(false);
  const [galleryFailed, setGalleryFailed] = useState(false);
  const renderGallery = enhanced && !galleryFailed;
  const usingGallery = renderGallery && galleryReady;

  useEffect(() => {
    if (!enhanced) setGalleryReady(false);
  }, [enhanced]);
  const items = useMemo(
    () => photos.map((photo) => ({
      image: getImageProps({ src: photo.src, alt: photo.alt, width: 320, height: 568 }).props.src,
      text: photo.caption,
      description: photo.alt,
      alt: photo.alt,
    })),
    [photos],
  );

  const updateActive = useCallback(() => {
    const track = trackRef.current;
    if (!track || usingGallery) return;
    const center = track.scrollLeft + track.clientWidth / 2;
    let closest = 0;
    let distance = Infinity;
    Array.from(track.children).forEach((child, index) => {
      const card = child as HTMLElement;
      const nextDistance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
      if (nextDistance < distance) {
        distance = nextDistance;
        closest = index;
      }
    });
    setActive(closest);
  }, [usingGallery]);

  useEffect(() => updateActive(), [updateActive]);

  const movePhoto = (direction: number) => {
    const next = Math.max(0, Math.min(photos.length - 1, active + direction));
    trackRef.current?.children[next]?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "nearest",
      inline: "center",
    });
    setActive(next);
  };

  if (!photos.length) return null;

  return (
    <div className="ann-photo-album">
      <div className="ann-album-heading">
        <span>我们的照片</span>
        <span>{String(photos.length).padStart(2, "0")} 张珍藏</span>
      </div>
      <div ref={frameRef} className="ann-photo-stage">
        <ol
          id={trackId}
          ref={trackRef}
          className="ann-photo-track"
          aria-label="可以左右滑动的照片"
          inert={usingGallery || undefined}
          onScroll={updateActive}
        >
          {photos.map((photo, index) => (
            <li key={`${photo.src}-${index}`} className="ann-photo-page">
              <figure className="ann-photo-print">
                <a
                  href={photo.src}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`放大查看第 ${index + 1} 张：${photo.alt}（新窗口）`}
                >
                  <span className="ann-photo-mat">
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(max-width: 760px) 76vw, 260px"
                    />
                  </span>
                  <span className="ann-photo-enlarge" aria-hidden="true">↗</span>
                </a>
                <figcaption>
                  <span className="ann-photo-number">{String(index + 1).padStart(2, "0")}</span>
                  <span>{photo.caption}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ol>
        {renderGallery ? (
          <div className="ann-photo-webgl" data-ready={usingGallery || undefined} aria-hidden={!usingGallery}>
            <CircularGallery
              items={items}
              bend={2}
              textColor="#f7ede1"
              borderRadius={0.025}
              font={'400 16px "Songti SC", serif'}
              fontUrl=""
              itemSize={0.9}
              itemAspect={0.72}
              gap={0.18}
              wave={0.35}
              fadeEdges={0.08}
              shadow={0.3}
              scrollSpeed={1.25}
              scrollEase={0.06}
              autoScroll={0}
              snap
              openOnClick
              dpr={1.5}
              onActiveChange={setActive}
              onReady={() => {
                setActive(0);
                setGalleryReady(true);
              }}
              onUnavailable={() => setGalleryFailed(true)}
              tabIndex={0}
              aria-label="我们的弧形相册，可用左右方向键切换照片"
            />
          </div>
        ) : null}
      </div>
      <div className="ann-album-footer">
        <p>{usingGallery ? "拖动照片 · 方向键切换 · 点开细看" : "左右滑动 · 点照片看完整画面"}</p>
        <span className="ann-album-count" aria-live="polite" aria-atomic="true">
          <span>{String(Math.min(active + 1, photos.length)).padStart(2, "0")}</span>
          <span aria-hidden="true"> / </span>
          <span className="ann-media-sr-only">，共 </span>
          {String(photos.length).padStart(2, "0")}
          <span className="ann-media-sr-only"> 张</span>
        </span>
        {!usingGallery ? (
          <div className="ann-album-navigation">
            <button type="button" onClick={() => movePhoto(-1)} disabled={active === 0} aria-label="上一张照片" aria-controls={trackId}>←</button>
            <button type="button" onClick={() => movePhoto(1)} disabled={active >= photos.length - 1} aria-label="下一张照片" aria-controls={trackId}>→</button>
          </div>
        ) : null}
      </div>
      <nav className="ann-photo-index" aria-label="逐张放大查看照片">
        <span className="ann-photo-index-label">每一张，都想珍藏</span>
        <ol>
          {photos.map((photo, index) => (
            <li key={`${photo.src}-index-${index}`}>
              <a href={photo.src} target="_blank" rel="noreferrer" aria-label={`查看第 ${index + 1} 张完整照片：${photo.alt}（新窗口）`}>
                <Image src={photo.src} alt={photo.alt} width={64} height={80} sizes="64px" />
                <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}

function DateCard({ date, caption }: { date: string; caption: string }) {
  const [year, month, day] = date.split(".");
  const hasParts = Boolean(year && month && day);
  return (
    <figure className="ann-date-keepsake">
      <span className="ann-date-tape" aria-hidden="true" />
      <div className="ann-date-keepsake-top"><span>初次相识</span><span>{hasParts ? year : "THE BEGINNING"}</span></div>
      <time dateTime={hasParts ? date.replaceAll(".", "-") : undefined}>
        {hasParts ? (
          <>
            <span className="ann-media-sr-only">{year} 年 </span>
            <span>{month}</span><span className="ann-date-divider" aria-hidden="true">/</span><span>{day}</span>
          </>
        ) : (
          <span className="ann-date-raw">{date}</span>
        )}
      </time>
      <figcaption>{caption}</figcaption>
      <span className="ann-date-keepsake-bottom" aria-hidden="true">THE FIRST PAGE OF US</span>
    </figure>
  );
}

export function TeaSticker({ label, caption, memory = "你给我买的那杯霸王茶姬，我一直记得。" }: { label: string; caption: string; memory?: string }) {
  return (
    <details className="ann-tea-memory">
      <summary>
        <span className="ann-tea-art" aria-hidden="true">
          <svg viewBox="0 0 280 330" fill="none">
            <path d="m179 80 19-55q2-7 8-5l3 1q5 2 3 8l-16 54" fill="#bd8b87" stroke="#fff9ef" strokeWidth="15" strokeLinejoin="round" />
            <path d="M64 86h153l-19 206q-1 13-14 13H96q-13 0-14-13Z" fill="#eee0ca" stroke="#fff9ef" strokeWidth="20" strokeLinejoin="round" />
            <path d="m76 104 16 183q1 8 9 8h81q8 0 9-8l17-183" stroke="#c8b59d" strokeWidth="2" />
            <path d="M56 72q0-10 11-10h148q10 0 10 10v14H56Z" fill="#86685d" stroke="#fff9ef" strokeWidth="16" strokeLinejoin="round" />
            <path d="M56 75h169v14H56Z" fill="#60483f" />
            <path d="M67 66h147" stroke="#c5ad97" strokeWidth="3" strokeLinecap="round" />
            <path d="M92 103h97M95 111h91" stroke="#d2bfa7" strokeWidth="1.5" />
            <circle cx="140" cy="172" r="43" fill="#f6ead7" stroke="#a4756c" strokeWidth="1.3" />
            <circle cx="140" cy="172" r="37" stroke="#b98b7c" strokeWidth="0.7" />
            <path d="M107 159q-13 10-3 24m69-24q13 10 3 24M115 142l-5-7m55 7 5-7M115 204l-5 7m55-7 5 7" stroke="#a4756c" strokeWidth="1.5" strokeLinecap="round" />
            <text x="140" y="186" textAnchor="middle" fill="#78504e" fontFamily="Songti SC, STSong, serif" fontSize="39">茶</text>
            <text x="140" y="247" textAnchor="middle" fill="#78504e" fontFamily="Songti SC, STSong, serif" fontSize="19" letterSpacing="3">霸王茶姬</text>
            <path d="M114 264h52" stroke="#b59a80" />
            <path d="m101 280 78 0" stroke="#d4c2aa" strokeWidth="2" />
          </svg>
        </span>
        <span className="ann-tea-paper-label"><strong>{label}</strong><span>{caption}</span></span>
        <span className="ann-tea-invitation"><span className="ann-tea-closed-copy">轻轻点一下，打开这份回忆</span><span className="ann-tea-open-copy">这点甜，一直放在心上</span><span className="ann-tea-toggle" aria-hidden="true">＋</span></span>
      </summary>
      <div className="ann-tea-recalled">
        <span>我想对你说</span>
        <p>{memory}</p>
      </div>
    </details>
  );
}

type AudioMedia = Extract<TimelineMedia, { type: "audio" }>;
type VideoMedia = Extract<TimelineMedia, { type: "video" }>;

function MediaNote({ title, note, kind }: { title: string; note: string; kind: "audio" | "video" }) {
  return (
    <article className={`ann-keepsake-note ann-keepsake-note-${kind}`}>
      <span className="ann-keepsake-note-mark" aria-hidden="true">{kind === "audio" ? "寄语" : "留影"}</span>
      <div><h3>{title}</h3><p>{note}</p></div>
    </article>
  );
}

export function AudioCard({ title, note, src }: Omit<AudioMedia, "type">) {
  if (!src) return <MediaNote title={title} note={note} kind="audio" />;
  return (
    <figure className="ann-recording-card">
      <figcaption><span>想放给你听</span><h3>{title}</h3><p>{note}</p></figcaption>
      <audio controls preload="metadata" src={src} aria-label={title}>
        你的浏览器无法播放这段音频。<a href={src}>打开音频文件</a>
      </audio>
    </figure>
  );
}

export function VideoCard({ title, note, src, poster }: Omit<VideoMedia, "type">) {
  if (!src) return <MediaNote title={title} note={note} kind="video" />;
  return (
    <figure className="ann-recording-card ann-recording-video">
      <video controls playsInline preload="metadata" src={src} poster={poster} aria-label={title}>
        你的浏览器无法播放这段视频。<a href={src}>打开视频文件</a>
      </video>
      <figcaption><span>和你一起留下的画面</span><h3>{title}</h3><p>{note}</p></figcaption>
    </figure>
  );
}

export function LetterCard() {
  return (
    <article className="ann-letter-card" aria-label="写给宝宝的一封信">
      <header className="ann-letter-heading"><span>第 1000 天 · 写给你</span><span aria-hidden="true">♡</span></header>
      <div className="ann-letter-body">
        <p className="ann-letter-greeting">{letterContent.greeting}</p>
        {letterContent.paragraphs.map((paragraph, index) => <p key={`letter-${index}`}>{paragraph}</p>)}
      </div>
      <footer className="ann-letter-signature"><span>{letterContent.sign}</span><time dateTime="2026-11-18">{letterContent.date}</time></footer>
    </article>
  );
}

export function renderMedia(media: TimelineMedia, index: number) {
  const key = `${media.id ?? media.type}-${index}`;
  switch (media.type) {
    case "date": return <DateCard key={key} date={media.date} caption={media.caption} />;
    case "photos": return <PhotoDeck key={key} photos={media.items} />;
    case "sticker": return <TeaSticker key={key} label={media.label} caption={media.caption} memory={media.memory} />;
    case "audio": return <AudioCard key={key} {...media} />;
    case "video": return <VideoCard key={key} {...media} />;
    case "letter": return <LetterCard key={key} />;
    default: return null;
  }
}
