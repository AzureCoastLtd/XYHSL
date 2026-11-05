"use client";

import { AudioLines, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const melody = [261.63, 329.63, 392, 523.25, 493.88, 392, 329.63, 293.66, 220, 261.63, 329.63, 440, 392, 329.63, 293.66, 261.63];

export default function AmbientSound() {
  const contextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | undefined>(undefined);
  const startingRef = useRef(false);
  const mountedRef = useRef(false);
  const [state, setState] = useState<"off" | "starting" | "on" | "unavailable">("off");

  const stop = useCallback(() => {
    window.clearInterval(timerRef.current);
    timerRef.current = undefined;
    const context = contextRef.current;
    contextRef.current = null;
    if (context && context.state !== "closed") void context.close().catch(() => undefined);
    if (mountedRef.current) setState("off");
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    // Starting a song or video pauses the ambient sound.
    const pauseForMedia = () => {
      if (contextRef.current) stop();
    };
    document.addEventListener("play", pauseForMedia, true);
    return () => {
      mountedRef.current = false;
      document.removeEventListener("play", pauseForMedia, true);
      stop();
    };
  }, [stop]);

  const toggle = async () => {
    if (startingRef.current) return;
    if (contextRef.current) {
      stop();
      return;
    }
    startingRef.current = true;
    setState("starting");
    try {
      const Constructor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Constructor) throw new Error("Audio unavailable");
      const context = new Constructor();
      contextRef.current = context;
      const master = context.createGain();
      master.gain.value = 0.13;
      master.connect(context.destination);
      await context.resume();
      if (!mountedRef.current || contextRef.current !== context) return;
      for (const media of document.querySelectorAll<HTMLMediaElement>("audio, video")) {
        if (!media.paused) media.pause();
      }

      let step = 0;
      const note = () => {
        const now = context.currentTime;
        const frequency = melody[step % melody.length];
        for (const [harmonic, volume] of [[1, 0.32], [2, 0.08], [3, 0.025]]) {
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          oscillator.type = "sine";
          oscillator.frequency.value = frequency * harmonic;
          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.exponentialRampToValueAtTime(volume, now + 0.025);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.7);
          oscillator.connect(gain);
          gain.connect(master);
          oscillator.start(now);
          oscillator.stop(now + 2.8);
        }
        step += 1;
      };
      note();
      timerRef.current = window.setInterval(note, 720);
      setState("on");
    } catch {
      stop();
      if (mountedRef.current) setState("unavailable");
    } finally {
      startingRef.current = false;
    }
  };

  const label = state === "on" ? "关闭轻音乐" : state === "unavailable" ? "重试播放轻音乐" : "播放轻音乐";
  return (
    <button className={`ann-sound-toggle ${state === "on" ? "is-playing" : ""}`} type="button" onClick={toggle} disabled={state === "starting"} aria-label={label} aria-pressed={state === "on"} title={label}>
      {state === "on" ? <AudioLines size={16} aria-hidden="true" /> : <VolumeX size={16} aria-hidden="true" />}
      <span>{state === "on" ? "轻音乐 · 开" : state === "unavailable" ? "点击重试" : "轻音乐 · 关"}</span>
    </button>
  );
}
