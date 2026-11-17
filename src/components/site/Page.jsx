import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "../../lib/utils";
import { EASE, fadeUp } from "../../lib/motion";

/** Judul yang muncul kata per kata dari balik "tirai" (naik dari bawah). */
export function RevealTitle({ text, className, as: Tag = "h1", delay = 0 }) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  return (
    <Tag aria-label={text} className={className}>
      {words.map((word, i) => (
        <span key={i} aria-hidden="true" className="inline-block overflow-hidden pb-[0.12em] align-top leading-[1.02]">
          <motion.span
            className="inline-block"
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, delay: delay + i * 0.07, ease: EASE }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 && " "}
        </span>
      ))}
    </Tag>
  );
}

function ScrollWord({ children, progress, range }) {
  const opacity = useTransform(progress, range, [0.22, 1]);
  return <motion.span style={{ opacity }}>{children}</motion.span>;
}

/** Paragraf yang "menyala" kata demi kata mengikuti gulir halaman. */
export function ScrollText({ text, className }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "end 0.55"] });
  const words = String(text || "").split(/(\s+)/);
  const count = words.filter((w) => w.trim()).length || 1;
  let n = 0;
  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => {
        if (!w.trim()) return w;
        const start = n / count;
        n += 1;
        return (
          <ScrollWord key={i} progress={scrollYProgress} range={[start, Math.min(1, start + 1.5 / count)]}>
            {w}
          </ScrollWord>
        );
      })}
    </p>
  );
}

/** Kerangka halaman isi: judul besar rata kiri, lalu isinya. */
export function Page({ title, intro, children, className }) {
  return (
    <div className={cn("mx-auto max-w-6xl px-5 pt-28 sm:px-8 sm:pt-36", className)}>
      {title && (
        <header className="mb-10 sm:mb-14">
          <RevealTitle text={title} className="font-display text-5xl font-medium tracking-[-0.035em] sm:text-7xl" />
          {intro && (
            <motion.p {...fadeUp(0.2)} className="mt-4 max-w-xl text-lg text-muted sm:text-xl">
              {intro}
            </motion.p>
          )}
        </header>
      )}
      <motion.div {...fadeUp(0.15)}>{children}</motion.div>
    </div>
  );
}

/** Judul kecil bagian + garis tipis, gaya "spesifikasi" Apple. */
export function SectionTitle({ children, id, className }) {
  return (
    <h2
      id={id}
      className={cn("scroll-mt-24 border-b border-line pb-3 text-sm font-semibold tracking-tight text-muted", className)}
    >
      {children}
    </h2>
  );
}
