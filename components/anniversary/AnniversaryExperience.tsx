"use client";

import Image from "next/image";
import Link from "next/link";
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { futureEntries, photoEntries, timelineEntries } from "./data";

type Star = {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  speed: number;
  phase: number;
};

const progressEntries = [
  { id: "opening", label: "OPEN" },
  ...timelineEntries.map((entry) => ({ id: entry.id, label: entry.date })),
  { id: "future", label: "NEXT" },
];

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
}

function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let pointerX = 0.5;
    let pointerY = 0.5;

    const seed = (value: number) => {
      const next = Math.sin(value * 12.9898) * 43758.5453;
      return next - Math.floor(next);
    };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.max(1, Math.floor(width * ratio));
      canvas.height = Math.max(1, Math.floor(height * ratio));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = width < 700 ? 48 : 90;
      stars = Array.from({ length: count }, (_, index) => ({
        x: seed(index + 1),
        y: seed(index + 101),
        radius: 0.35 + seed(index + 201) * 1.45,
        alpha: 0.22 + seed(index + 301) * 0.58,
        speed: 0.06 + seed(index + 401) * 0.18,
        phase: seed(index + 501) * Math.PI * 2,
      }));
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);
      const seconds = time / 1000;

      for (const star of stars) {
        const drift = reduced ? 0 : Math.sin(seconds * star.speed + star.phase) * 0.0018;
        const x = (star.x + drift + (pointerX - 0.5) * star.radius * 0.003) * width;
        const y = (star.y + drift * 0.45 + (pointerY - 0.5) * star.radius * 0.002) * height;
        const twinkle = reduced ? 1 : 0.72 + Math.sin(seconds * star.speed * 4 + star.phase) * 0.28;
        context.beginPath();
        context.fillStyle = `rgba(244, 220, 189, ${star.alpha * twinkle})`;
        context.arc(x, y, star.radius, 0, Math.PI * 2);
        context.fill();
      }

      if (!reduced) animationFrame = window.requestAnimationFrame(draw);
    };

    const onPointerMove = (event: PointerEvent) => {
      pointerX = event.clientX / Math.max(window.innerWidth, 1);
      pointerY = event.clientY / Math.max(window.innerHeight, 1);
    };

    resize();
    draw(0);
    if (!reduced) animationFrame = window.requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="ann-starfield" aria-hidden="true" />;
}

function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8%" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`ann-reveal ${visible ? "is-visible" : ""} ${className}`}>
      {children}
    </div>
  );
}

function BlurReveal({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={`ann-blur-reveal ${className}`} aria-label={text}>
      {Array.from(text).map((character, index) => (
        <span key={`${character}-${index}`} aria-hidden="true">
          {character === " " ? "\u00A0" : character}
        </span>
      ))}
    </span>
  );
}

function ProgressRail({ activeId }: { activeId: string }) {
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

function PhotoDeck() {
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

function TeaSticker() {
  return (
    <div className="ann-tea-sticker" role="img" aria-label="霸王茶姬记忆贴纸">
      <div className="ann-tea-cup">
        <span className="ann-tea-lid" />
        <span className="ann-tea-logo">茶</span>
        <span className="ann-tea-label">FIRST SIP</span>
      </div>
      <span className="ann-sticker-tape" aria-hidden="true" />
      <span className="ann-tea-copy">霸王茶姬<br />我们的第一杯</span>
    </div>
  );
}

function AudioSlot() {
  return (
    <div className="ann-media-slot ann-audio-slot">
      <span className="ann-media-icon" aria-hidden="true">♪</span>
      <div>
        <span className="ann-media-kicker">A SONG FOR THIS PAGE</span>
        <strong>《青花瓷》</strong>
        <p>音频文件准备好后，可以在这里点击播放。</p>
      </div>
      <button type="button" disabled aria-label="青花瓷音频等待替换">
        等待替换
      </button>
    </div>
  );
}

function VideoSlot() {
  return (
    <div className="ann-media-slot ann-video-slot">
      <span className="ann-video-frame" aria-hidden="true">
        <span className="ann-play-mark">▶</span>
      </span>
      <div>
        <span className="ann-media-kicker">A MOVING MEMORY</span>
        <strong>视频回忆插槽</strong>
        <p>等你把某一段动态回忆放进这封信。</p>
      </div>
    </div>
  );
}

function AmbientMusic() {
  const contextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      void contextRef.current?.close();
    };
  }, []);

  const toggle = async () => {
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

    const context = new AudioContextConstructor();
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

    await context.resume();
    playPhrase();
    timerRef.current = window.setInterval(playPhrase, 3200);
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

function TimelineEntryCard({ entry }: { entry: (typeof timelineEntries)[number] }) {
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
        {entry.id === "become-us" ? <PhotoDeck /> : null}
        {entry.id === "tea" ? (
          <div className="ann-memory-tools">
            <TeaSticker />
            <AmbientMusic />
          </div>
        ) : null}
        {entry.id === "letter" ? (
          <div className="ann-letter-tools">
            <AudioSlot />
            <VideoSlot />
          </div>
        ) : null}
        {entry.id === "thousand" ? (
          <div className="ann-letter-card">
            <span className="ann-letter-mark">A NOTE FOR YOU</span>
            <p>宝宝，</p>
            <p>这封信写在纸上，而我们的故事藏在这里。</p>
            <p>1000 天只是我们的一小部分，<br />我们还有无数个 1000 天。</p>
            <span className="ann-letter-sign">— 待你继续写下去</span>
          </div>
        ) : null}
      </Reveal>
    </article>
  );
}

function FutureSection() {
  return (
    <section id="future" className="ann-future-section">
      <div className="ann-future-glow" aria-hidden="true" />
      <Reveal className="ann-future-intro">
        <span className="ann-kicker">THE STORY CONTINUES</span>
        <p className="ann-future-eyebrow">1000 DAYS / NOT THE END</p>
        <h2>下一页，<em>未完待续。</em></h2>
        <p>有些愿望不需要提前写上日期，只要它们还在我们的未来里。</p>
      </Reveal>
      <div className="ann-future-grid">
        {futureEntries.map((entry) => (
          <Reveal key={entry.id} className="ann-future-card">
            <span>{entry.index}</span>
            <h3>{entry.title}</h3>
            <p>{entry.description}</p>
            <i aria-hidden="true">···</i>
          </Reveal>
        ))}
      </div>
      <Reveal className="ann-final-note">
        <span className="ann-final-line" aria-hidden="true" />
        <p>这封信写在纸上，而我们的故事藏在这里。</p>
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          再看一遍 <span aria-hidden="true">↗</span>
        </button>
        <Link href="/christmas" className="ann-old-gift-link">
          还有一个旧礼物 <span aria-hidden="true">↗</span>
        </Link>
      </Reveal>
    </section>
  );
}

export default function AnniversaryExperience() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState("opening");
  const reducedMotion = useReducedMotion();
  const sectionIds = useMemo(() => progressEntries.map((entry) => entry.id), []);

  useEffect(() => {
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveId(visible.target.id);
      },
      { threshold: [0.12, 0.35, 0.6], rootMargin: "-20% 0px -55%" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [sectionIds]);

  const openLetter = () => {
    setIsOpen(true);
    window.setTimeout(() => {
      document.getElementById("first-page")?.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });
    }, reducedMotion ? 0 : 420);
  };

  return (
    <main className={`anniversary-page ${isOpen ? "is-letter-open" : ""}`}>
      <Starfield />
      <div className="ann-noise" aria-hidden="true" />
      <div className="ann-ambient ann-ambient-one" aria-hidden="true" />
      <div className="ann-ambient ann-ambient-two" aria-hidden="true" />
      <ProgressRail activeId={activeId} />

      <header className="ann-header">
        <Link href="/" className="ann-brand" aria-label="回到 1000 天首页">
          XYHSL <span>1000 DAYS</span>
        </Link>
        <Link href="/christmas" className="ann-header-link">
          旧礼物 <span aria-hidden="true">↗</span>
        </Link>
      </header>

      <section id="opening" className="ann-hero">
        <div className="ann-hero-orbit ann-hero-orbit-one" aria-hidden="true" />
        <div className="ann-hero-orbit ann-hero-orbit-two" aria-hidden="true" />
        <div className="ann-hero-copy">
          <span className="ann-kicker">A LETTER IN MOTION / 2026</span>
          <p className="ann-hero-count">01 <span>/</span> ∞</p>
          <h1>宝宝，<br /><em>打开这封信。</em></h1>
          <p className="ann-hero-subtitle">这封信写在纸上，而我们的故事藏在这里。</p>
        </div>
        <button
          type="button"
          className={`ann-envelope ${isOpen ? "is-open" : ""}`}
          onClick={openLetter}
          aria-expanded={isOpen}
          aria-label={isOpen ? "信已打开" : "打开写给宝宝的信"}
        >
          <span className="ann-envelope-shadow" aria-hidden="true" />
          <span className="ann-envelope-body" aria-hidden="true" />
          <span className="ann-envelope-flap" aria-hidden="true" />
          <span className="ann-envelope-paper" aria-hidden="true">
            <span>1000</span>
            <small>days</small>
          </span>
          <span className="ann-envelope-seal" aria-hidden="true">∞</span>
        </button>
        <div className="ann-hero-action">
          <span className="ann-scroll-line" aria-hidden="true" />
          <span>{isOpen ? "信已打开，向下阅读" : "点击打开，然后向下阅读"}</span>
        </div>
      </section>

      <div className="ann-timeline">
        <div className="ann-timeline-line" aria-hidden="true" />
        {timelineEntries.map((entry) => (
          <TimelineEntryCard key={entry.id} entry={entry} />
        ))}
      </div>

      <FutureSection />
    </main>
  );
}
