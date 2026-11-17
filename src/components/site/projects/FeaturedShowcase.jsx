import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ProjectCover } from "../ProjectCover";
import { mediaThumb } from "../../../lib/utils";
import { useFinePointer, usePointerParallax } from "../../../lib/pointer";
import { useLang } from "../../../i18n/language";

/**
 * Proyek unggulan (desktop): judul raksasa terbelah dua dengan kartu gambar di tengah.
 * Saat digulir, kedua bagian judul bergeser menjauh & kartu sedikit berputar.
 */
export function FeaturedShowcase({ project }) {
  const { t, tr, to } = useLang();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const left = useTransform(scrollYProgress, [0, 1], ["6%", "-14%"]);
  const right = useTransform(scrollYProgress, [0, 1], ["-6%", "14%"]);
  const rotate = useTransform(scrollYProgress, [0, 0.5, 1], [-7, 0, 6]);
  const cardY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  // kartu sedikit mengikuti kursor (lapisan paling depan → gerak paling jauh)
  const fine = useFinePointer();
  const { x: px, y: py } = usePointerParallax(ref, { enabled: fine });
  const cardPX = useTransform(px, (v) => v * 18);
  const cardPY = useTransform(py, (v) => v * 12);
  const cardTilt = useTransform(px, (v) => v * 3);
  const cardRotate = useTransform([rotate, cardTilt], ([a, b]) => a + b);
  const cardYAll = useTransform([cardY, cardPY], ([a, b]) => a + b);

  const title = tr(project, "title");
  const words = title.split(/\s+/);
  const half = Math.ceil(words.length / 2);
  const first = words.length > 1 ? words.slice(0, half).join(" ") : title.slice(0, Math.ceil(title.length / 2));
  const second = words.length > 1 ? words.slice(half).join(" ") : title.slice(Math.ceil(title.length / 2));
  const cover = mediaThumb(project.media.find((m) => m.type !== "video"));

  return (
    <section ref={ref} className="relative mb-24 overflow-hidden py-20">
      <p className="mb-6 flex items-center justify-between text-xs font-medium uppercase tracking-[0.18em] text-muted">
        <span className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-pine" /> {t("projects.featured")}
        </span>
        <span>{[project.category, project.year].filter(Boolean).join(" · ")}</span>
      </p>
      <Link to={to(`/projects/${project.slug}`)} className="relative block" aria-label={title}>
        <div aria-hidden="true" className="flex min-h-[clamp(14.7rem,28vw,24rem)] items-center justify-center whitespace-nowrap font-display text-[clamp(4rem,11vw,10rem)] font-semibold leading-none tracking-[-0.055em]">
          <motion.span style={{ x: left }} className="relative z-0">
            {first}
          </motion.span>
          <span className="inline-block w-[clamp(9rem,18vw,15rem)] shrink-0" />
          <motion.span style={{ x: right }} className="relative z-0">
            {second}
          </motion.span>
        </div>
        <motion.div
          style={{ rotate: cardRotate, y: cardYAll, x: cardPX }}
          className="absolute left-1/2 top-1/2 z-10 aspect-[3/4] w-[clamp(11rem,21vw,18rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl shadow-[0_22px_45px_-18px_rgb(43_32_28/0.45)]"
        >
          {cover ? <img src={cover} alt="" className="h-full w-full object-cover" /> : <ProjectCover title={title} size="lg" />}
        </motion.div>
      </Link>
      {tr(project, "summary") && <p className="mx-auto mt-20 max-w-md text-center text-muted">{tr(project, "summary")}</p>}
    </section>
  );
}
