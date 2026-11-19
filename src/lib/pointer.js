import { useEffect, useState } from "react";
import { motionValue } from "framer-motion";

const FINE = "(hover: hover) and (pointer: fine)";
const REDUCE = "(prefers-reduced-motion: reduce)";

const canHoverNow = () =>
  typeof window !== "undefined" && window.matchMedia(FINE).matches && !window.matchMedia(REDUCE).matches;

/**
 * true hanya bila pengunjung memakai mouse/trackpad DAN tidak memilih "kurangi gerakan".
 * Semua efek kursor (magnet, miring, parallax) memakai ini, jadi di HP/tablet sentuh efeknya mati.
 */
export function useCanHover() {
  const [ok, setOk] = useState(canHoverNow);
  useEffect(() => {
    const fine = window.matchMedia(FINE);
    const reduce = window.matchMedia(REDUCE);
    const update = () => setOk(fine.matches && !reduce.matches);
    update();
    fine.addEventListener("change", update);
    reduce.addEventListener("change", update);
    return () => {
      fine.removeEventListener("change", update);
      reduce.removeEventListener("change", update);
    };
  }, []);
  return ok;
}

/*
 * Posisi kursor di layar, dinormalisasi ke -1..1 (0 = tengah layar).
 * Satu pendengar dipakai bersama oleh semua lapisan parallax, dan hanya terpasang
 * selama ada komponen yang membutuhkannya. Nilainya motion value, jadi tidak memicu render React.
 */
export const pointerX = motionValue(0);
export const pointerY = motionValue(0);

let users = 0;
const onMove = (e) => {
  if (e.pointerType === "touch") return;
  pointerX.set((e.clientX / window.innerWidth) * 2 - 1);
  pointerY.set((e.clientY / window.innerHeight) * 2 - 1);
};
// Kursor keluar jendela → lapisan kembali ke tengah.
const onLeave = (e) => {
  if (e.relatedTarget) return;
  pointerX.set(0);
  pointerY.set(0);
};

export function usePointerTracking(active) {
  useEffect(() => {
    if (!active) return;
    if (users++ === 0) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("mouseout", onLeave);
    }
    return () => {
      if (--users > 0) return;
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseout", onLeave);
      pointerX.set(0);
      pointerY.set(0);
    };
  }, [active]);
}
