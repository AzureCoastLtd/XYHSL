"use client";

import Image from "next/image";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { type TimelineMedia, letterContent, photoEntries } from "./data";

export function PhotoDeck() {
  return (
    <div className="ann-photo-deck" aria-label="我们的照片">
      {photoEntries.map((photo, index) => (
        <figure
          key={photo.src}
          className="ann-photo-card"
          style={{ "--photo-rotate": `${index % 2 === 0 ? -3 : 3}deg` } as CSSProperties}
        >
          <div className="ann-photo-image">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 700px) 42vw, 190px"
              priority={index < 2}
            />
          </div>
          <figcaption>{index < 2 ? "一页还没有写完的故事" : "待补充日期"}</figcaption>
        </figure>
      ))}
    </div>
  );
}

export function TeaSticker({ label, caption }: { label: string; caption: string }) {
  return (
    <div className="ann-tea-sticker" role="img" aria-label={`${label} 记忆贴纸`}>
      <div className="ann-tea-cup">
        <span className="ann-tea-lid" />
        <span className="ann-tea-logo">茶</span>
        <span className="ann-tea-label">FIRST SIP</span>
      </div>
      <span className="ann-sticker-tape" aria-hidden="true" />
      <span className="ann-tea-copy">{label}<br />{caption}</span>
    </div>
  );
}

export function AudioSlot({ title, note }: { title: string; note: string }) {
  return (
    <div className="ann-media-slot ann-audio-slot">
      <span className="ann-media-icon" aria-hidden="true">♪</span>
      <div>
        <span className="ann-media-kicker">A SONG FOR THIS PAGE</span>
        <strong>{title}</strong>
        <p>{note}</p>
      </div>
      <button type="button" disabled aria-label={`${title} 音频等待替换`}>
        等待替换
      </button>
    </div>
  );
}

export function VideoSlot({ title, note }: { title: string; note: string }) {
  return (
    <div className="ann-media-slot ann-video-slot">
      <span className="ann-video-frame" aria-hidden="true">
        <span className="ann-play-mark">▶</span>
      </span>
      <div>
        <span className="ann-media-kicker">A MOVING MEMORY</span>
        <strong>{title}</strong>
        <p>{note}</p>
      </div>
    </div>
  );
}

export function LetterCard() {
  return (
    <div className="ann-letter-card">
      <span className="ann-letter-mark">A NOTE FOR YOU</span>
      <p>{letterContent.greeting}</p>
      <p>{letterContent.opening}</p>
      <p>{letterContent.promise}<br />{letterContent.promiseLine}</p>
      <span className="ann-letter-sign">{letterContent.sign}</span>
    </div>
  );
}

export function AmbientMusic() {
  const contextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);
  const startingRef = useRef(false);
  const unmountedRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    unmountedRef.current = false;
    return () => {
      unmountedRef.current = true;
      if (timerRef.current) window.clearInterval(timerRef.current);
      void contextRef.current?.close();
    };
  }, []);

  const toggle = async () => {
    if (startingRef.current) return;

    if (playing) {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
      await contextRef.current?.close();
      contextRef.current = null;
      setPlaying(false);
      return;
    }

    const AudioContextConstructor =
      window.AudioContext ??
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextConstructor) {
      setSupported(false);
      return;
    }

    startingRef.current = true;
    let context: AudioContext;
    try {
      context = new AudioContextConstructor();
    } catch {
      startingRef.current = false;
      setSupported(false);
      return;
    }
    const master = context.createGain();
    master.gain.setValueAtTime(0.0001, context.currentTime);
    master.gain.exponentialRampToValueAtTime(0.035, context.currentTime + 1.2);
    master.connect(context.destination);
    contextRef.current = context;

    const playPhrase = () => {
      const now = context.currentTime + 0.05;
      [261.63, 329.63, 392, 493.88].forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const start = now + index * 0.42;
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, start);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.035, start + 0.18);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 2.2);
        oscillator.connect(gain);
        gain.connect(master);
        oscillator.start(start);
        oscillator.stop(start + 2.25);
      });
    };

    try {
      await context.resume();
    } catch {
      startingRef.current = false;
      contextRef.current = null;
      await context.close().catch(() => undefined);
      setSupported(false);
      return;
    }

    if (unmountedRef.current || contextRef.current !== context) {
      startingRef.current = false;
      await context.close().catch(() => undefined);
      return;
    }

    playPhrase();
    timerRef.current = window.setInterval(playPhrase, 3200);
    startingRef.current = false;
    setPlaying(true);
  };

  return (
    <button
      type="button"
      className={`ann-sound-control ${playing ? "is-playing" : ""}`}
      onClick={toggle}
      disabled={!supported}
      aria-pressed={playing}
    >
      <span className="ann-sound-bars" aria-hidden="true"><i /><i /><i /></span>
      {supported ? (playing ? "轻音乐播放中" : "打开一段轻音乐") : "设备不支持音频"}
    </button>
  );
}

export function renderMedia(media: TimelineMedia, index: number) {
  const key = `${media.type}-${index}`;
  if (media.type === "photos") return <PhotoDeck key={key} />;
  if (media.type === "sticker") {
    return <TeaSticker key={key} label={media.label} caption={media.caption} />;
  }
  if (media.type === "ambient") return <AmbientMusic key={key} />;
  if (media.type === "audio") {
    return <AudioSlot key={key} title={media.title} note={media.note} />;
  }
  if (media.type === "video") {
    return <VideoSlot key={key} title={media.title} note={media.note} />;
  }
  return <LetterCard key={key} />;
}
