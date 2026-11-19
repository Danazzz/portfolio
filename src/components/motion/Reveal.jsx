import { Fragment } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { DURATION, EASE, EASE_IN_OUT, STAGGER } from "../../lib/motion";
import { cn } from "../../lib/utils";

const VIEWPORT = { once: true, margin: "0px 0px -10% 0px" };

/**
 * Blok yang muncul pelan dari bawah saat masuk layar (sekali saja).
 * `index` memberi jeda berurutan untuk item daftar (dibatasi supaya daftar panjang tidak terasa lambat).
 */
export function Reveal({ as = "div", index = 0, delay = 0, y = 22, className, children, ...props }) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: DURATION.base, ease: EASE, delay: delay + Math.min(index, 5) * STAGGER }}
      {...props}
    >
      {children}
    </Tag>
  );
}

/**
 * Teks besar yang naik per kata dari balik garis (seperti judul majalah).
 * Pembaca layar membaca teks utuhnya; potongan per kata disembunyikan dari mereka.
 *  - onView : mulai saat masuk layar (default: langsung saat halaman dibuka)
 */
export function MaskText({ text, as: Tag = "span", className, delay = 0, stagger = 0.08, onView = false }) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const play = onView ? { whileInView: { y: "0%" }, viewport: VIEWPORT } : { animate: { y: "0%" } };
  return (
    <Tag className={className}>
      <span className="sr-only">{text}</span>
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          {i > 0 && " "}
          <span aria-hidden="true" className="mask-word">
            <motion.span
              className="inline-block"
              initial={{ y: "112%" }}
              {...play}
              transition={{ duration: DURATION.slow, ease: EASE, delay: delay + i * stagger }}
            >
              {word}
            </motion.span>
          </span>
        </Fragment>
      ))}
    </Tag>
  );
}

/**
 * Bingkai gambar yang membuka seperti tirai dari bawah, sementara gambarnya
 * mengendap dari sedikit diperbesar. Tanpa pergeseran tata letak (ukuran bingkai tetap).
 */
export function RevealFrame({ className, children, delay = 0, onView = true }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={cn("relative overflow-hidden", className)}>{children}</div>;
  const play = onView ? { whileInView: "shown", viewport: VIEWPORT } : { animate: "shown" };
  return (
    <motion.div
      className={cn("overflow-hidden", className)}
      initial="hidden"
      {...play}
      variants={{
        hidden: { clipPath: "inset(18% 0% 0% 0%)" },
        shown: { clipPath: "inset(0% 0% 0% 0%)", transitionEnd: { clipPath: "none" } },
      }}
      transition={{ duration: DURATION.reveal, ease: EASE_IN_OUT, delay }}
    >
      <motion.div
        className="relative h-full w-full"
        variants={{ hidden: { scale: 1.14, opacity: 0.4 }, shown: { scale: 1, opacity: 1 } }}
        transition={{ duration: DURATION.reveal + 0.3, ease: EASE, delay }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/** Garis tipis yang tergambar dari kiri ke kanan. */
export function RevealRule({ className, delay = 0, onView = false }) {
  const play = onView ? { whileInView: { scaleX: 1 }, viewport: VIEWPORT } : { animate: { scaleX: 1 } };
  return (
    <motion.hr
      aria-hidden="true"
      className={cn("origin-left border-0 border-t border-line", className)}
      initial={{ scaleX: 0 }}
      {...play}
      transition={{ duration: DURATION.reveal, ease: EASE, delay }}
    />
  );
}
