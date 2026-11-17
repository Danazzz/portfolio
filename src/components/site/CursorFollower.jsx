import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useMediaQuery } from "../../lib/hooks";
import { cn } from "../../lib/utils";

/**
 * Lingkaran yang mengikuti kursor (khusus mouse/trackpad, tidak di layar sentuh).
 * Kursor asli tetap tampil — lingkaran ini hanya aksen:
 *  - di atas link/tombol: membesar
 *  - di atas elemen ber-atribut data-cursor="Teks": menjadi lingkaran berisi teks (mis. "View")
 */
export function CursorFollower() {
  const fine = useMediaQuery("(hover: hover) and (pointer: fine)");
  const reduce = useReducedMotion();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 380, damping: 32, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 380, damping: 32, mass: 0.6 });
  const [state, setState] = useState({ visible: false, hover: false, label: "" });

  useEffect(() => {
    if (!fine || reduce) return;
    const onMove = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const target = e.target instanceof Element ? e.target : null;
      const labelled = target?.closest("[data-cursor]");
      const interactive = target?.closest("a, button, [role='button'], summary, input, select, textarea");
      setState((s) => {
        const next = { visible: true, hover: Boolean(interactive), label: labelled?.getAttribute("data-cursor") || "" };
        return s.visible === next.visible && s.hover === next.hover && s.label === next.label ? s : next;
      });
    };
    const onLeave = () => setState((s) => ({ ...s, visible: false }));
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [fine, reduce, x, y]);

  if (!fine || reduce) return null;

  const size = state.label ? 84 : state.hover ? 44 : 26;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[70]"
      style={{ x: sx, y: sy }}
    >
      <motion.div
        animate={{ width: size, height: size, opacity: state.visible ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        className={cn(
          "grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full",
          state.label ? "bg-ink text-bg" : state.hover ? "border border-accent/60 bg-accent/10" : "border border-ink/30",
        )}
      >
        <AnimatePresence>
          {state.label && (
            <motion.span
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              className="text-xs font-semibold tracking-wide"
            >
              {state.label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
