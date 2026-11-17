import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import pineapple from "../../../assets/hero/pineapple.jpg";
import { Magnetic } from "../../motion/Magnetic";
import { useFinePointer, usePointerParallax } from "../../../lib/pointer";
import { EASE } from "../../../lib/motion";
import { cn } from "../../../lib/utils";

/*
 * Panel hero: foto nanas di balik "kaca bergaris" (terinspirasi zeewrk).
 *  - Tiap bilah memuat salinan foto yang sedikit diperbesar (efek lensa).
 *  - Bilah di dekat kursor membias: fotonya bergeser menjauh dengan pegas.
 *  - Lapisan latar, foto & chip bergerak pada kedalaman berbeda (parallax).
 * Foto: "Pineapple Fruit With White Background" — Tony Wu, Pexels (Pexels License).
 * Latar putih foto dilebur ke krem dengan mix-blend-multiply.
 */

const SLATS = 11;
const BACKDROP = "#ece0d1";

function Slat({ i, px, inside }) {
  const center = ((i + 0.5) / SLATS) * 2 - 1; // posisi bilah dalam satuan -1..1
  // geser foto menjauhi kursor, paling kuat tepat di bawah kursor (kurva Gauss),
  // dikali `inside` supaya bias muncul/hilang halus saat kursor masuk/keluar panel
  const x = useTransform([px, inside], ([v, k]) => {
    const d = v - center;
    return -Math.sign(d || 1) * Math.exp(-(d * d) / 0.06) * 24 * k;
  });
  return (
    <div
      className="absolute inset-y-0 overflow-hidden"
      style={{ left: `${(i / SLATS) * 100}%`, width: `${100 / SLATS + 0.15}%`, backgroundColor: BACKDROP }}
    >
      <motion.img
        src={pineapple}
        alt=""
        draggable="false"
        style={{
          x,
          left: `${-i * 100}%`,
          width: `${SLATS * 100}%`,
          transformOrigin: `${((i + 0.5) / SLATS) * 100}% 50%`,
        }}
        className="absolute top-0 h-full max-w-none scale-x-[1.07] object-cover mix-blend-multiply"
      />
      {/* kilau kaca: terang di tepi kiri, bayangan di tepi kanan */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(255_255_255/0.35)_0%,rgb(255_255_255/0.06)_14%,transparent_55%,rgb(59_43_38/0.1)_100%)]" />
    </div>
  );
}

/** Chip penunjuk: [● teks]——• (garis & titik mengarah ke nanas). */
function Pointer({ label, side = "left", style, className }) {
  const line = <span className="h-px w-10 bg-[#3b2b26]/35 sm:w-16" />;
  const dot = <span className="size-2 rounded-full border-2 border-white bg-[#3b2b26] shadow" />;
  const chip = (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/75 px-3 py-1.5 text-xs font-medium text-[#3b2b26] shadow-[0_8px_24px_-12px_rgb(59_43_38/0.4)] backdrop-blur-md sm:text-sm">
      <span className="size-1.5 rounded-full bg-pine" />
      {label}
    </span>
  );
  return (
    <motion.div style={style} className={cn("pointer-events-none absolute z-20 flex items-center", className)}>
      {side === "left" ? (
        <>
          {chip}
          {line}
          {dot}
        </>
      ) : (
        <>
          {dot}
          {line}
          {chip}
        </>
      )}
    </motion.div>
  );
}

export function PineapplePanel({ interests = [], label, projectsHref, children, className }) {
  const fine = useFinePointer();
  const ref = useRef(null);
  const { x: px, y: py, inside } = usePointerParallax(ref, { enabled: fine });

  // kedalaman berbeda per lapisan → terasa berlapis
  const bgX = useTransform(px, (v) => v * -10);
  const bgY = useTransform(py, (v) => v * -8);
  const chipAX = useTransform(px, (v) => v * 16);
  const chipAY = useTransform(py, (v) => v * 12);
  const chipBX = useTransform(px, (v) => v * 24);
  const chipBY = useTransform(py, (v) => v * 18);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, clipPath: "inset(12% 8% 12% 8% round 2rem)" }}
      animate={{ opacity: 1, clipPath: "inset(0% 0% 0% 0% round 2rem)" }}
      transition={{ duration: 1.3, delay: 0.15, ease: EASE }}
      className={cn("relative isolate overflow-hidden rounded-[2rem]", className)}
      style={{ backgroundColor: BACKDROP }}
    >
      {/* latar: cahaya hangat lembut */}
      <motion.div
        style={{ x: bgX, y: bgY }}
        className="absolute -inset-[6%] bg-[radial-gradient(60%_50%_at_50%_42%,#f8efe4_0%,transparent_70%),radial-gradient(40%_25%_at_50%_92%,rgb(125_90_80/0.18),transparent_70%)]"
      />

      {/* foto di balik bilah kaca */}
      <div className="absolute inset-0">
        {Array.from({ length: SLATS }, (_, i) => (
          <Slat key={i} i={i} px={px} inside={inside} />
        ))}
      </div>

      {/* vinyet + butiran halus supaya terasa sinematik */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_45%,transparent_55%,rgb(59_43_38/0.18)_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-60 mix-blend-multiply [background-image:var(--grain)]" />

      {/* label kapsul vertikal + tombol magnetik */}
      {label && (
        <div className="absolute left-4 top-4 z-20 flex flex-col items-center gap-3 sm:left-5 sm:top-5">
          <span className="rounded-full bg-white/80 px-2 py-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#3b2b26] backdrop-blur-md [writing-mode:vertical-rl] rotate-180">
            {label}
          </span>
          {projectsHref && (
            <Magnetic strength={0.4} radius={40}>
              <Link
                to={projectsHref}
                aria-label="Projects"
                className="group grid size-10 place-items-center rounded-full bg-[#2b201c] text-[#faf6f1] shadow-lg transition-colors hover:bg-[#7d5a50]"
              >
                <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:rotate-45" />
              </Link>
            </Magnetic>
          )}
        </div>
      )}

      {/* chip penunjuk berisi minat */}
      {interests[0] && <Pointer label={interests[0]} side="left" style={{ x: chipAX, y: chipAY }} className="left-[16%] top-[27%]" />}
      {interests[1] && <Pointer label={interests[1]} side="right" style={{ x: chipBX, y: chipBY }} className="right-[8%] top-[60%]" />}

      {children}
    </motion.div>
  );
}
