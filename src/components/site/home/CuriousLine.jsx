import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

const HOLD_MS = 2200; // lama kata tampil utuh
const START_MS = 1200; // jeda sebelum mulai mengetik

/**
 * "Currently curious about ___": kata terakhir diketik → ditahan → dihapus →
 * diganti minat berikutnya. Tanpa animasi: semua minat tampil sebagai satu baris.
 */
export function CuriousLine({ label, items }) {
  const reduce = useReducedMotion();
  const [text, setText] = useState("");

  useEffect(() => {
    if (reduce || !items.length) return;
    let i = 0;
    let pos = 0;
    let phase = "type";
    let timer;
    setText("");

    const step = () => {
      const word = items[i];
      if (phase === "type") {
        pos += 1;
        setText(word.slice(0, pos));
        if (pos >= word.length) {
          phase = "hold";
          timer = setTimeout(step, HOLD_MS);
        } else {
          timer = setTimeout(step, 55 + Math.random() * 55);
        }
      } else if (phase === "hold") {
        if (items.length === 1) return;
        phase = "delete";
        timer = setTimeout(step, 0);
      } else {
        pos -= 1;
        setText(word.slice(0, pos));
        if (pos <= 0) {
          phase = "type";
          i = (i + 1) % items.length;
          timer = setTimeout(step, 380);
        } else {
          timer = setTimeout(step, 26);
        }
      }
    };
    timer = setTimeout(step, START_MS);
    return () => clearTimeout(timer);
  }, [items, reduce]);

  if (!items.length) return null;

  return (
    <p className="text-[clamp(1.35rem,3.6vw,2.25rem)] leading-snug tracking-[-0.02em] text-muted">
      {label}
      <br />
      <span className="sr-only">{items.join(", ")}</span>
      <span aria-hidden="true" className="font-medium text-accent">
        {reduce ? (
          items.join(", ")
        ) : (
          <>
            {text}
            <span className="ml-0.5 inline-block h-[0.95em] w-[2px] translate-y-[0.12em] bg-accent animate-caret" />
          </>
        )}
      </span>
    </p>
  );
}
