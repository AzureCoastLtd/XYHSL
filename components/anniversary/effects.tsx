"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

type Star = {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  speed: number;
  phase: number;
};

export function useReducedMotion() {
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

export function Starfield() {
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

export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
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

export function BlurReveal({ text, className = "" }: { text: string; className?: string }) {
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
