import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { fadeUp } from "../../lib/motion";
import { MaskText, Reveal, RevealRule } from "../motion/Reveal";

const pad = (n) => String(n).padStart(2, "0");

/**
 * Kerangka halaman isi: judul raksasa yang naik dari balik garis (dengan jumlah item kecil
 * di sampingnya bila ada), garis tipis yang tergambar, lalu isinya.
 */
export function Page({ title, count, intro, children, className }) {
  return (
    <div className={cn("frame pt-28 sm:pt-40", className)}>
      {title && (
        <header className="mb-12 sm:mb-20">
          <h1 className="display text-[clamp(3.25rem,14vw,11rem)]">
            <MaskText text={title} delay={0.1} />
            {count > 0 && (
              // Pembungkus memakai ukuran huruf judul (pt dalam em judul) supaya angka sejajar puncak huruf.
              <span className="ml-2 inline-block pt-[0.1em] align-top sm:ml-3">
                <motion.span
                  {...fadeUp(0.55)}
                  className="block text-[max(0.8rem,0.13em)] font-medium tabular-nums tracking-normal text-muted"
                >
                  ({pad(count)})
                </motion.span>
              </span>
            )}
          </h1>
          {intro && (
            <motion.p {...fadeUp(0.3)} className="mt-6 max-w-xl text-lg text-muted sm:text-xl">
              {intro}
            </motion.p>
          )}
          <RevealRule className="mt-8 sm:mt-12" delay={0.35} />
        </header>
      )}
      <motion.div {...fadeUp(0.3)}>{children}</motion.div>
    </div>
  );
}

/**
 * Judul bagian bergaya editorial: nomor kecil "(01)" + nama bagian.
 * Di layar lebar biasanya diletakkan di kolom kiri dan menempel saat digulir (sticky).
 */
export function SectionTitle({ children, id, index, className }) {
  return (
    <Reveal
      as="h2"
      id={id}
      className={cn("flex scroll-mt-28 items-baseline gap-3 text-2xl font-medium tracking-[-0.025em] sm:text-3xl", className)}
    >
      {index != null && <span className="eyebrow tabular-nums">({pad(index)})</span>}
      {children}
    </Reveal>
  );
}

/**
 * Bagian dua kolom: judul di kiri (menempel saat digulir di layar lebar), isi di kanan.
 * Kolom kanan dimulai di kolom grid ke-5, sejajar dengan teks utama halaman.
 */
export function SplitSection({ title, id, index, children, className }) {
  return (
    <section className={cn("grid gap-6 border-t border-line pt-6 sm:grid-cols-12 sm:gap-8 sm:pt-8", className)}>
      <div className="sm:col-span-4">
        <SectionTitle id={id} index={index} className="sm:sticky sm:top-28">
          {title}
        </SectionTitle>
      </div>
      <div className="min-w-0 sm:col-span-8">{children}</div>
    </section>
  );
}
