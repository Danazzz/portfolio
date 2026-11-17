import { useEffect, useState } from "react";
import { useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { SPRINGS } from "./motion";

const FINE = "(hover: hover) and (pointer: fine)";

/**
 * true jika perangkat memakai mouse/trackpad DAN pengunjung tidak meminta
 * "kurangi gerakan". Semua efek yang bergantung pada hover memakai ini,
 * jadi di layar sentuh efeknya otomatis mati.
 */
export function useFinePointer() {
  const reduce = useReducedMotion();
  const [fine, setFine] = useState(() => typeof window !== "undefined" && window.matchMedia(FINE).matches);
  useEffect(() => {
    const mql = window.matchMedia(FINE);
    const on = () => setFine(mql.matches);
    mql.addEventListener("change", on);
    return () => mql.removeEventListener("change", on);
  }, []);
  return fine && !reduce;
}

/**
 * Posisi kursor ternormalisasi (-1..1) relatif terhadap sebuah elemen + seberapa
 * "di dalam" kursor berada (0..1),
 * dihaluskan dengan pegas "parallax" (ada jeda → terasa berat & dalam).
 * Satu listener pointermove per pemakai; tidak memicu render ulang React.
 */
export function usePointerParallax(ref, { enabled = true, spring = SPRINGS.parallax } = {}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const inside = useMotionValue(0);
  const sx = useSpring(x, spring);
  const sy = useSpring(y, spring);
  const sInside = useSpring(inside, { stiffness: 90, damping: 22 });

  useEffect(() => {
    if (!enabled) return;
    let rect = null;
    const measure = () => (rect = ref.current?.getBoundingClientRect() || null);
    const onMove = (e) => {
      if (!rect) measure();
      if (!rect) return;
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      x.set(Math.max(-1.5, Math.min(1.5, nx)));
      y.set(Math.max(-1.5, Math.min(1.5, ny)));
      inside.set(Math.abs(nx) <= 1 && Math.abs(ny) <= 1 ? 1 : 0);
    };
    const reset = () => {
      x.set(0);
      y.set(0);
      inside.set(0);
    };
    const invalidate = () => (rect = null);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", invalidate, { passive: true });
    window.addEventListener("resize", invalidate);
    document.addEventListener("mouseleave", reset);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", invalidate);
      window.removeEventListener("resize", invalidate);
      document.removeEventListener("mouseleave", reset);
    };
  }, [ref, enabled, x, y, inside]);

  /** x, y: -1..1 (dihaluskan) · inside: 0..1 (kursor di dalam elemen, dihaluskan) */
  return { x: sx, y: sy, inside: sInside };
}
