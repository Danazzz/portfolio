import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

const BASE = 380; // ketebalan normal
const PEAK = 820; // ketebalan tepat di bawah kursor

const smooth = (k) => k * k * (3 - 2 * k);
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

/**
 * Nama besar yang "bernapas": ketebalan tiap huruf berubah mengikuti kursor
 * (atau jari di HP). Saat halaman dibuka, efeknya menyapu sekali dari kiri ke kanan.
 * Pengunjung yang mematikan animasi melihat nama dengan ketebalan tetap.
 */
export function LivingName({ name }) {
  const reduce = useReducedMotion();
  const rootRef = useRef(null);
  const letters = useRef([]);
  const words = String(name || "").trim().split(/\s+/).filter(Boolean);

  useEffect(() => {
    if (reduce) return;
    const els = letters.current.filter(Boolean);
    const root = rootRef.current;
    if (!els.length || !root) return;

    const weights = els.map(() => BASE);
    let pointer = null;
    let raf = 0;
    const introStart = performance.now() + 450;
    const INTRO_MS = 1700;

    const tick = (now) => {
      raf = 0;
      const box = root.getBoundingClientRect();
      const fontSize = parseFloat(getComputedStyle(root).fontSize) || 80;
      const radius = fontSize * 2.4;

      let target = pointer;
      const t = (now - introStart) / INTRO_MS;
      const intro = t < 1;
      if (intro && !pointer && t > 0) {
        target = {
          x: box.left - radius + (box.width + radius * 2) * easeInOut(t),
          y: box.top + box.height / 2,
        };
      }

      let busy = intro;
      els.forEach((el, i) => {
        let goal = BASE;
        if (target) {
          const r = el.getBoundingClientRect();
          const dx = target.x - (r.left + r.width / 2);
          const dy = (target.y - (r.top + r.height / 2)) * 1.6;
          const k = Math.max(0, 1 - Math.hypot(dx, dy) / radius);
          goal = BASE + (PEAK - BASE) * smooth(k);
        }
        weights[i] += (goal - weights[i]) * 0.16;
        if (Math.abs(goal - weights[i]) > 0.4) busy = true;
        el.style.fontVariationSettings = `"wght" ${weights[i].toFixed(1)}`;
      });
      if (busy) raf = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onMove = (e) => {
      pointer = { x: e.clientX, y: e.clientY };
      kick();
    };
    const onRelease = (e) => {
      if (e.type === "mouseout" ? e.relatedTarget : e.pointerType === "mouse") return;
      pointer = null;
      kick();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    window.addEventListener("pointerup", onRelease, { passive: true });
    window.addEventListener("pointercancel", onRelease, { passive: true });
    document.addEventListener("mouseout", onRelease);
    kick();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      window.removeEventListener("pointerup", onRelease);
      window.removeEventListener("pointercancel", onRelease);
      document.removeEventListener("mouseout", onRelease);
    };
  }, [reduce, name]);

  letters.current = [];
  let n = 0;

  return (
    <h1
      ref={rootRef}
      aria-label={name}
      className="select-none text-[clamp(3.4rem,min(14vw,13.5vh),8.75rem)] leading-[0.92] tracking-[-0.045em]"
      style={{ fontWeight: reduce ? 600 : BASE }}
    >
      {words.map((word, w) => (
        <span key={w} aria-hidden="true">
          {w > 0 && " "}
          <span className="inline-block whitespace-nowrap">
            {[...word].map((ch, i) => {
              const index = n++;
              return (
                <span
                  key={i}
                  ref={(el) => (letters.current[index] = el)}
                  className="inline-block"
                  style={reduce ? undefined : { fontVariationSettings: `"wght" ${BASE}` }}
                >
                  {ch}
                </span>
              );
            })}
          </span>
        </span>
      ))}
    </h1>
  );
}
