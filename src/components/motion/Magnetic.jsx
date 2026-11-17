import { useEffect, useRef } from "react";
import { motion, useSpring } from "framer-motion";
import { useFinePointer } from "../../lib/pointer";
import { SPRINGS } from "../../lib/motion";
import { cn } from "../../lib/utils";

/**
 * Elemen "magnetik": saat kursor mendekat (dalam `radius` px dari tepinya),
 * elemen tertarik ke arah kursor sejauh `strength` × jarak (maks `max` px),
 * lalu kembali dengan pegas saat kursor menjauh. Isi (teks/ikon) ikut bergeser
 * sedikit lebih jauh supaya terasa berlapis.
 * Hanya aktif dengan mouse; di layar sentuh / reduced motion elemen diam.
 */
export function Magnetic({ children, className, strength = 0.35, radius = 70, max = 14, inner = true }) {
  const fine = useFinePointer();
  const ref = useRef(null);
  const x = useSpring(0, SPRINGS.magnetic);
  const y = useSpring(0, SPRINGS.magnetic);
  const ix = useSpring(0, SPRINGS.magnetic);
  const iy = useSpring(0, SPRINGS.magnetic);

  useEffect(() => {
    if (!fine) return;
    let rect = null;
    const measure = () => (rect = ref.current?.getBoundingClientRect() || null);
    const clamp = (v) => Math.max(-max, Math.min(max, v));
    const onMove = (e) => {
      if (!rect) measure();
      if (!rect) return;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const near =
        e.clientX > rect.left - radius &&
        e.clientX < rect.right + radius &&
        e.clientY > rect.top - radius &&
        e.clientY < rect.bottom + radius;
      const dx = near ? clamp((e.clientX - cx) * strength) : 0;
      const dy = near ? clamp((e.clientY - cy) * strength) : 0;
      x.set(dx);
      y.set(dy);
      ix.set(dx * 0.35);
      iy.set(dy * 0.35);
    };
    const invalidate = () => (rect = null);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", invalidate, { passive: true });
    window.addEventListener("resize", invalidate);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", invalidate);
      window.removeEventListener("resize", invalidate);
      x.set(0);
      y.set(0);
      ix.set(0);
      iy.set(0);
    };
  }, [fine, strength, radius, max, x, y, ix, iy]);

  return (
    <motion.span ref={ref} style={{ x, y }} className={cn("inline-flex", className)}>
      {inner ? (
        <motion.span style={{ x: ix, y: iy }} className="inline-flex w-full">
          {children}
        </motion.span>
      ) : (
        children
      )}
    </motion.span>
  );
}
