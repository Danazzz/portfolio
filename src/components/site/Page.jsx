import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { fadeUp } from "../../lib/motion";

/** Kerangka halaman isi: judul besar rata kiri, lalu isinya. */
export function Page({ title, intro, children, className }) {
  return (
    <div className={cn("mx-auto max-w-5xl px-5 pt-28 sm:px-8 sm:pt-36", className)}>
      {title && (
        <motion.header {...fadeUp()} className="mb-10 sm:mb-14">
          <h1 className="text-5xl font-semibold tracking-[-0.035em] sm:text-7xl">{title}</h1>
          {intro && <p className="mt-4 max-w-xl text-lg text-muted sm:text-xl">{intro}</p>}
        </motion.header>
      )}
      <motion.div {...fadeUp(0.08)}>{children}</motion.div>
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
