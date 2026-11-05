"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { useVisualMode } from "./effects";
import "./atmosphere.css";

const LightRays = dynamic(() => import("../reactbits/LightRays"), { ssr: false });
const Particles = dynamic(() => import("../reactbits/Particles"), { ssr: false });
const starColors = ["#f7ede1", "#e7c39b", "#e0a19d"];

export function LightAtmosphere() {
  const ref = useRef<HTMLDivElement>(null);
  const { enhanced } = useVisualMode(ref);

  return (
    <div ref={ref} className="ann-light-atmosphere" aria-hidden="true">
      <div className="ann-light-still" />
      {enhanced ? (
        <LightRays
          raysOrigin="top-right"
          raysColor="#f0d2ae"
          raysSpeed={0.22}
          lightSpread={0.48}
          rayLength={1.35}
          rayDensity={0.75}
          raySharpness={0.45}
          tilt={-8}
          glow={0.35}
          haze={0.12}
          atmosphere={0.18}
          intensity={0.55}
          fadeDistance={1.3}
          saturation={0.8}
          followMouse
          mouseInfluence={0.06}
          cursorShadow={false}
          clickPulse={false}
          noiseAmount={0.02}
          distortion={0.08}
          maxDevicePixelRatio={1.5}
          opacity={0.58}
        />
      ) : null}
    </div>
  );
}

export function MilestoneAtmosphere() {
  const ref = useRef<HTMLDivElement>(null);
  const { enhanced } = useVisualMode(ref);

  return (
    <div ref={ref} className="ann-particle-atmosphere" aria-hidden="true">
      <div className="ann-milestone-halo" />
      {enhanced ? (
        <Particles
          particleCount={1000}
          particleColors={starColors}
          particleSpread={9}
          speed={0.07}
          particleBaseSize={55}
          sizeRandomness={0.9}
          cameraDistance={23}
          disableRotation
          pixelRatio={1.5}
          glow={0.3}
          twinkle={0.35}
          depthOfField={0.15}
          connections={false}
          moveParticlesOnHover={false}
          clickBurst={false}
          drift="up"
          driftSpeed={0.18}
          opacity={0.6}
        />
      ) : null}
    </div>
  );
}
