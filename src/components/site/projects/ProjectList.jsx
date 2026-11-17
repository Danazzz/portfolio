import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { ProjectCover } from "../ProjectCover";
import { Reveal } from "../../motion/Reveal";
import { mediaThumb } from "../../../lib/utils";
import { useLang } from "../../../i18n/language";

/**
 * Desktop: daftar proyek berupa baris besar. Saat baris disorot, gambar proyek
 * muncul & mengikuti kursor (dengan sedikit "telat" supaya terasa luwes).
 */
export function ProjectList({ projects }) {
  const { tr, to } = useLang();
  const wrap = useRef(null);
  const [hovered, setHovered] = useState(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 160, damping: 20, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 160, damping: 20, mass: 0.6 });
  const rotate = useSpring(0, { stiffness: 120, damping: 14 });
  const lastX = useRef(0);

  const onMove = (e) => {
    const r = wrap.current.getBoundingClientRect();
    x.set(e.clientX - r.left);
    y.set(e.clientY - r.top);
    // sedikit miring searah gerakan kursor
    rotate.set(Math.max(-8, Math.min(8, (e.clientX - lastX.current) * 0.6)));
    lastX.current = e.clientX;
  };

  const active = projects.find((p) => p.id === hovered);
  const cover = active && mediaThumb(active.media.find((m) => m.type !== "video"));

  return (
    <div ref={wrap} className="relative" onPointerMove={onMove} onPointerLeave={() => setHovered(null)}>
      <ul className="border-t border-line">
        {projects.map((project, i) => {
          const title = tr(project, "title");
          return (
            <Reveal as="li" key={project.id} delay={i * 0.06} className="border-b border-line">
              <Link
                to={to(`/projects/${project.slug}`)}
               
                onPointerEnter={() => setHovered(project.id)}
                className="group grid grid-cols-[3rem_1fr_auto] items-baseline gap-6 py-7 transition-colors duration-500 hover:text-ink"
              >
                <span className="text-sm tabular-nums text-muted">{String(i + 1).padStart(2, "0")}</span>
                <span className="min-w-0">
                  <span
                    className={`block font-display text-[clamp(2rem,4.4vw,3.75rem)] font-medium leading-[1.05] tracking-[-0.035em] transition duration-500 ease-out group-hover:translate-x-3 ${
                      hovered && hovered !== project.id ? "opacity-30" : ""
                    }`}
                  >
                    {title}
                  </span>
                  {tr(project, "summary") && (
                    <span className="mt-1 block max-w-xl text-muted transition-opacity duration-500 group-hover:opacity-100 sm:opacity-80">
                      {tr(project, "summary")}
                    </span>
                  )}
                </span>
                <span className="flex items-center gap-3 text-sm text-muted">
                  {[project.category, project.year].filter(Boolean).join(" · ")}
                  <ArrowUpRight className="size-5 transition duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
                </span>
              </Link>
            </Reveal>
          );
        })}
      </ul>

      {/* gambar melayang mengikuti kursor */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-10"
        style={{ x: sx, y: sy, rotate }}
      >
        <AnimatePresence>
          {active && (
            <motion.div
              key={active.id}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="-mt-28 ml-10 h-56 w-80 overflow-hidden rounded-2xl shadow-[0_20px_40px_-16px_rgb(43_32_28/0.45)]"
            >
              {cover ? (
                <img src={cover} alt="" className="h-full w-full object-cover" />
              ) : (
                <ProjectCover title={tr(active, "title")} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
