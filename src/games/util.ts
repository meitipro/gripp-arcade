"use client";
import { useEffect, useRef, useState } from "react";

/** Calls fn(dtSeconds, totalSeconds) every animation frame and re-renders. Time comes from performance.now. */
export function useFrame(fn: (dt: number, t: number) => void, active = true) {
  const [, setTick] = useState(0);
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    if (!active) return;
    let raf = 0, last = performance.now();
    const t0 = last;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ref.current(dt, (now - t0) / 1000);
      setTick((x) => (x + 1) % 1e9);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active]);
}
export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const now = () => performance.now();
export function useTimeout() {
  const ids = useRef<number[]>([]);
  useEffect(() => () => ids.current.forEach(clearTimeout), []);
  return (fn: () => void, ms: number) => { ids.current.push(window.setTimeout(fn, ms)); };
}
export function beep(freq = 440, ms = 90, vol = 0.04) {
  try {
    const AC = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
    const c = new AC(); const o = c.createOscillator(); const g = c.createGain();
    o.frequency.value = freq; o.type = "sine"; g.gain.value = vol; o.connect(g); g.connect(c.destination);
    o.start(); setTimeout(() => { o.stop(); c.close(); }, ms);
  } catch { /* audio is optional */ }
}
