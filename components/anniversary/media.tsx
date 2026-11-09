"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { AnniversaryContent, PhotoEntry, TimelineMedia } from "./data";
import { useVisualMode } from "./effects";
import "./media.css";

const CircularGallery = dynamic(() => import("../reactbits/CircularGallery"), {
  ssr: false,
  loading: () => null,
});

export function PhotoDeck({ photos, gallery = false, title, note }: { photos: PhotoEntry[]; gallery?: boolean; title?: string; note?: string }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const trackId = useId();
  const { enhanced, reduced } = useVisualMode(frameRef);
  const [active, setActive] = useState(0);
  const [galleryReady, setGalleryReady] = useState(false);
  const [galleryFailed, setGalleryFailed] = useState(false);
  const renderGallery = gallery && enhanced && !galleryFailed;
  const usingGallery = renderGallery && galleryReady;

  useEffect(() => {
    if (!enhanced) setGalleryReady(false);
  }, [enhanced]);
  const items = useMemo(
    () => photos.map((photo) => ({
      image: photo.previewSrc ?? photo.src,
      text: photo.caption,
      description: photo.alt,
      alt: photo.alt,
    })),
    [photos],
  );

  const updateActive = useCallback(() => {
    const track = trackRef.current;
    if (!track || usingGallery) return;
    if (track.scrollLeft <= 1) {
      setActive(0);
      return;
    }
    if (track.scrollLeft >= track.scrollWidth - track.clientWidth - 1) {
      setActive(Math.max(0, track.children.length - 1));
      return;
    }
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
    <div className="ann-photo-album" data-gallery={gallery || undefined}>
      <div className="ann-album-heading">
        <span>{title ?? "我们的照片"}</span>
        <span>{String(photos.length).padStart(2, "0")} 张珍藏</span>
      </div>
      {note ? <p className="ann-album-note">{note}</p> : null}
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
                      src={photo.previewSrc ?? photo.src}
                      unoptimized
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
        <ol>
          {photos.map((photo, index) => (
            <li key={`${photo.src}-index-${index}`}>
              <a href={photo.src} target="_blank" rel="noreferrer" aria-label={`查看第 ${index + 1} 张完整照片：${photo.alt}（新窗口）`}>
                <Image src={photo.previewSrc ?? photo.src} alt={photo.alt} width={64} height={80} sizes="64px" unoptimized />
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
    </figure>
  );
}

export function TeaSticker({ label, caption, memory, image, audio }: Extract<TimelineMedia, { type: "sticker" }>) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playback, setPlayback] = useState<"idle" | "loading" | "playing" | "paused" | "ended" | "error">("idle");

  useEffect(() => {
    const player = audioRef.current;
    return () => player?.pause();
  }, []);

  const play = (restart = false) => {
    const player = audioRef.current;
    if (!player) return;
    if (player.error) player.load();
    if (restart || player.ended) player.currentTime = 0;
    setPlayback("loading");
    void player.play().catch((error: unknown) => {
      if (error instanceof DOMException && error.name === "AbortError") return;
      if (audioRef.current === player) setPlayback("error");
    });
  };

  const toggleCup = () => {
    if (detailsRef.current?.open) audioRef.current?.pause();
    else play(true);
  };

  const playing = playback === "playing" || playback === "loading";
  return (
    <details ref={detailsRef} className="ann-tea-memory">
      <summary onClick={audio ? toggleCup : undefined}>
        <span className="ann-tea-art">
          <Image src={image.src} alt={image.alt} width={image.width ?? 640} height={image.height ?? 880} sizes="244px" unoptimized />
          <span className="ann-tea-brand-sticker" aria-hidden="true">CHAGEE<span>一杯 · 知音</span></span>
        </span>
        <span className="ann-tea-paper-label"><strong>{label}</strong><span>{caption}</span></span>
        <span className="ann-tea-invitation"><span className="ann-tea-closed-copy">{audio ? `轻点杯子，听一段《${audio.title}》` : "轻轻点一下，打开这份回忆"}</span><span className="ann-tea-open-copy">这点甜，一直放在心上</span><span className="ann-tea-toggle" aria-hidden="true">＋</span></span>
      </summary>
      <div className="ann-tea-recalled">
        <span>我想对你说</span>
        <p>{memory ?? caption}</p>
        {audio ? <>
        <div className="ann-tea-song">
          <div><strong>《{audio.title}》</strong><span aria-live="polite">{playback === "error" ? "暂时未能播放，请重试" : playback === "loading" ? "正在载入这一段…" : playback === "playing" ? "正在播放 · 为遇见你伏笔" : playback === "ended" ? "这一段，唱给你听" : "一段歌，留在这杯茶里"}</span></div>
          <button type="button" onClick={() => playing ? audioRef.current?.pause() : play()} aria-label={`${playing ? "暂停" : playback === "ended" ? "重播" : "播放"}《${audio.title}》选段`}>{playing ? "暂停" : playback === "ended" ? "再听一遍" : playback === "error" ? "重试播放" : "播放这一段"}</button>
        </div>
        <audio ref={audioRef} src={audio.src} preload="none" data-resume-ambient onPlaying={() => setPlayback("playing")} onWaiting={() => setPlayback("loading")} onPause={() => setPlayback(audioRef.current?.ended ? "ended" : "paused")} onEnded={() => setPlayback("ended")} onError={() => setPlayback("error")} />
        </> : null}
      </div>
    </details>
  );
}

function MemoryPrint({ photo, title, note, expandable }: Extract<TimelineMedia, { type: "print" }>) {
  const image = (
    <a href={photo.src} target="_blank" rel="noreferrer" aria-label={`查看完整照片：${photo.alt}（新窗口）`}>
      <Image src={photo.previewSrc ?? photo.src} alt={photo.alt} width={photo.width ?? 640} height={photo.height ?? 880} sizes="(max-width: 760px) 88vw, 520px" unoptimized />
      <span className="ann-print-enlarge" aria-hidden="true">↗</span>
    </a>
  );
  return (
    <figure className="ann-memory-print" data-landscape={Boolean(photo.width && photo.height && photo.width > photo.height) || undefined}>
      {title ? <div className="ann-print-title">{title}</div> : null}
      {expandable ? <details className="ann-print-fold"><summary>展开这页珍藏<span aria-hidden="true">＋</span></summary>{image}</details> : image}
      <figcaption>{photo.caption}</figcaption>
      {note ? <p className="ann-print-note">{note}</p> : null}
    </figure>
  );
}

export function LetterCard({ letterContent }: { letterContent: AnniversaryContent["letterContent"] }) {
  return (
    <article className="ann-letter-card" aria-label="写给宝宝的一封信">
      <header className="ann-letter-heading"><span>第 1000 天 · 写给你</span><span aria-hidden="true">♡</span></header>
      <div className="ann-letter-body">
        <p className="ann-letter-greeting">{letterContent.greeting}</p>
        {letterContent.paragraphs.map((paragraph, index) => <p key={`letter-${index}`}>{paragraph}</p>)}
      </div>
      <footer className="ann-letter-signature"><span>{letterContent.sign}</span><time dateTime={letterContent.date.replaceAll(".", "-")}>{letterContent.date}</time></footer>
    </article>
  );
}

export function renderMedia(media: TimelineMedia, index: number, content: Pick<AnniversaryContent, "photoEntries" | "letterContent">) {
  const key = `${media.id ?? media.type}-${index}`;
  switch (media.type) {
    case "date": return <DateCard key={key} date={media.date} caption={media.caption} />;
    case "photos": return <PhotoDeck key={key} photos={media.items ?? content.photoEntries} gallery={media.gallery} title={media.title} note={media.note} />;
    case "sticker": return <TeaSticker key={key} {...media} />;
    case "print": return <MemoryPrint key={key} {...media} />;
    case "letter": return <LetterCard key={key} letterContent={content.letterContent} />;
    default: return null;
  }
}
