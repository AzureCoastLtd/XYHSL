"use client";

import { type CSSProperties, type ReactNode, type RefObject, useEffect, useRef, useState } from "react";

let webGLAvailable: boolean | undefined;

export function useReducedMotion() {
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
}

// Canvas enhancement is opt-in after hydration. The DOM remains the default reading surface.
export function useVisualMode(ref: RefObject<HTMLElement | null>) {
  const [mode, setMode] = useState({ enhanced: false, compact: true, reduced: true });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const compact = window.matchMedia("(max-width: 760px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;

    const update = () => {
      const eligible = visible && !document.hidden && !compact.matches && !reduced.matches;
      if (eligible && webGLAvailable === undefined) {
        try {
          const probe = document.createElement("canvas").getContext("webgl2", { powerPreference: "low-power" });
          webGLAvailable = Boolean(probe);
          probe?.getExtension("WEBGL_lose_context")?.loseContext();
        } catch {
          webGLAvailable = false;
        }
      }
      setMode({
        enhanced: eligible && webGLAvailable === true,
        compact: compact.matches,
        reduced: reduced.matches,
      });
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    observer.observe(element);
    compact.addEventListener("change", update);
    reduced.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    update();

    return () => {
      observer.disconnect();
      compact.removeEventListener("change", update);
      reduced.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, [ref]);

  return mode;
}

const stars = Array.from({ length: 40 }, (_, index) => ({
  left: `${((index * 61 + 13) % 997) / 10}%`,
  top: `${((index * 127 + 37) % 991) / 10}%`,
  opacity: 0.15 + (index % 5) * 0.08,
  width: index % 7 === 0 ? 2 : 1,
  height: index % 7 === 0 ? 2 : 1,
} satisfies CSSProperties));

export function Starfield() {
  return (
    <div className="ann-starfield" aria-hidden="true">
      {stars.map((style, index) => <i key={index} style={style} />)}
    </div>
  );
}

export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let animation: Animation | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      animation = element.animate(
        [{ opacity: 0.7, transform: "translateY(18px)" }, { opacity: 1, transform: "none" }],
        { duration: 560, easing: "cubic-bezier(.16,1,.3,1)" },
      );
      observer.disconnect();
    }, { threshold: 0.08 });
    observer.observe(element);
    return () => {
      observer.disconnect();
      animation?.cancel();
    };
  }, []);

  return <div ref={ref} className={`ann-reveal is-visible ${className}`}>{children}</div>;
}
