import { createContext, useContext, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useCanHover } from "../../lib/pointer";
import { SPRING } from "../../lib/motion";
import { cn } from "../../lib/utils";

const MagneticContext = createContext(null);
const smoothstep = (t) => t * t * (3 - 2 * t);

/**
 * Elemen magnetik: tertarik ke arah kursor saat kursor mendekat (belum menyentuh pun sudah terasa),
 * lalu kembali ke tempatnya dengan pegas saat kursor menjauh.
 *  - strength : porsi jarak kursor yang diikuti (0.3 = 30%)
 *  - reach    : jarak (px) di luar tepi elemen tempat tarikan mulai terasa, melemah halus ke 0
 * Hanya aktif untuk mouse/trackpad dan bila pengunjung tidak memilih "kurangi gerakan".
 */
export function Magnetic({ children, strength = 0.3, reach = 28, className }) {
  const canHover = useCanHover();
  const anchorRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, SPRING.magnet);
  const sy = useSpring(y, SPRING.magnet);

  useEffect(() => {
    if (!canHover) {
      x.set(0);
      y.set(0);
      return;
    }
    const anchor = anchorRef.current;
    let last = null;

    // Diukur dari pembungkus yang diam (bukan elemen yang bergerak) supaya tidak saling memengaruhi.
    const pull = () => {
      if (!last || !anchor) return;
      const r = anchor.getBoundingClientRect();
      const dx = last.x - (r.left + r.width / 2);
      const dy = last.y - (r.top + r.height / 2);
      const outside = Math.hypot(Math.max(0, Math.abs(dx) - r.width / 2), Math.max(0, Math.abs(dy) - r.height / 2));
      const k = outside >= reach ? 0 : 1 - smoothstep(outside / reach);
      x.set(dx * strength * k);
      y.set(dy * strength * k);
    };
    const onMove = (e) => {
      if (e.pointerType === "touch") return;
      last = { x: e.clientX, y: e.clientY };
      pull();
    };
    const onLeave = (e) => {
      if (e.relatedTarget) return;
      last = null;
      x.set(0);
      y.set(0);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", pull, { passive: true });
    document.addEventListener("mouseout", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", pull);
      document.removeEventListener("mouseout", onLeave);
      x.set(0);
      y.set(0);
    };
  }, [canHover, strength, reach, x, y]);

  return (
    <span ref={anchorRef} className={cn("inline-flex", className)}>
      <motion.span className="inline-flex w-full" style={{ x: sx, y: sy }}>
        <MagneticContext.Provider value={{ x: sx, y: sy }}>{children}</MagneticContext.Provider>
      </motion.span>
    </span>
  );
}

/**
 * Isi tombol magnetik (label/ikon) yang bergeser sedikit lebih jauh dari bingkainya,
 * sehingga tombol terasa berlapis. Di luar <Magnetic> tampil biasa.
 */
export function MagneticLabel({ children, factor = 0.45, className }) {
  const ctx = useContext(MagneticContext);
  const fallback = useMotionValue(0);
  const x = useTransform(ctx?.x ?? fallback, (v) => v * factor);
  const y = useTransform(ctx?.y ?? fallback, (v) => v * factor);
  return (
    <motion.span className={cn("inline-flex items-center", className)} style={{ x, y }}>
      {children}
    </motion.span>
  );
}
