import { forwardRef, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Play } from "lucide-react";
import { Page } from "../../components/site/Page";
import { ProjectCover } from "../../components/site/ProjectCover";
import { Tilt, TiltLayer } from "../../components/motion/Tilt";
import { RevealFrame } from "../../components/motion/Reveal";
import { usePortfolio } from "../../lib/portfolio";
import { DURATION, EASE } from "../../lib/motion";
import { cn, mediaThumb } from "../../lib/utils";
import { useLang } from "../../i18n/language";

const ALL = "__all__";
const pad = (n) => String(n).padStart(2, "0");

/**
 * Tile proyek: sampul yang membuka seperti tirai saat masuk layar, lalu miring 3D
 * mengikuti kursor (gambar & tombol panah bergeser sebagai lapisan berbeda).
 * Di bawahnya: nomor urut, judul (garis bawah tumbuh saat disorot), kategori · tahun, ringkasan.
 * (forwardRef: dibutuhkan AnimatePresence mode "popLayout" saat filter berganti.)
 */
const ProjectTile = forwardRef(function ProjectTile({ project, number, wide }, ref) {
  const { tr, to } = useLang();
  const title = tr(project, "title");
  const summary = tr(project, "summary");
  const cover = mediaThumb(project.media.find((m) => m.type !== "video"));
  const hasVideo = project.media.some((m) => m.type !== "image");
  const meta = [project.category, project.year].filter(Boolean).join(" · ");

  return (
    <motion.li
      ref={ref}
      layout
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: DURATION.base, ease: EASE }}
      className={cn(wide && "sm:col-span-2")}
    >
      <Link to={to(`/projects/${project.slug}`)} className="group block rounded-[1.25rem] outline-offset-4 sm:rounded-[1.75rem]">
        <Tilt
          max={wide ? 2.5 : 4.5}
          className={wide ? "aspect-[4/3] sm:aspect-[2/1]" : "aspect-[4/3] sm:aspect-[16/11]"}
          innerClassName="overflow-hidden rounded-[1.25rem] bg-surface-2 sm:rounded-[1.75rem]"
        >
          <RevealFrame className="h-full w-full">
            {cover ? (
              <TiltLayer depth={-12} className="absolute -inset-4">
                <img
                  src={cover}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[1.4s] ease-out-expo group-hover:scale-[1.05]"
                />
              </TiltLayer>
            ) : (
              <ProjectCover
                title={title}
                label={project.category}
                className="transition-transform duration-[1.4s] ease-out-expo group-hover:scale-[1.03]"
              />
            )}
          </RevealFrame>

          {/* Tombol panah: muncul & berputar saat disorot, mengambang sebagai lapisan paling depan */}
          <TiltLayer depth={10} className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
            <span className="grid size-11 scale-75 place-items-center rounded-full bg-bg text-ink opacity-0 shadow-float transition duration-500 ease-out-expo group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100 sm:size-14">
              <ArrowUpRight className="size-5 rotate-45 transition-transform duration-500 ease-out-expo group-hover:rotate-0" />
            </span>
          </TiltLayer>
          {hasVideo && (
            <span className="absolute bottom-4 left-4 z-20 inline-flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1.5 text-xs font-medium text-white backdrop-blur sm:bottom-6 sm:left-6">
              <Play className="size-3 fill-current" aria-hidden="true" /> Video
            </span>
          )}
        </Tilt>

        <div className="mt-5 grid grid-cols-[2.25rem_1fr] items-baseline gap-x-2 sm:mt-6 sm:grid-cols-[3rem_1fr_auto]">
          <span className="eyebrow tabular-nums">{pad(number)}</span>
          <h2 className={cn("font-medium tracking-[-0.025em]", wide ? "text-2xl sm:text-4xl" : "text-2xl sm:text-3xl")}>
            <span className="link-line-group pb-0.5">{title}</span>
          </h2>
          {meta && <span className="eyebrow col-start-2 mt-2 sm:col-start-3 sm:mt-0">{meta}</span>}
          {summary && <p className="col-[2/-1] mt-2 max-w-xl text-muted">{summary}</p>}
        </div>
      </Link>
    </motion.li>
  );
});

export default function ProjectsPage() {
  const { data } = usePortfolio();
  const { t } = useLang();
  const { projects } = data;
  const [filter, setFilter] = useState(ALL);
  const categories = useMemo(
    () => [ALL, ...new Set(projects.map((p) => p.category).filter(Boolean))],
    [projects],
  );
  // Proyek unggulan tampil lebar di urutan atas. Nomor urut mengikuti urutan tampil di "Semua",
  // jadi tetap sama saat filter berganti.
  const featuredFirst = (list) => [...list.filter((p) => p.featured), ...list.filter((p) => !p.featured)];
  const numbering = featuredFirst(projects);
  const ordered = featuredFirst(filter === ALL ? projects : projects.filter((p) => p.category === filter));

  return (
    <Page title={t("nav.projects")} count={projects.length}>
      {categories.length > 2 && (
        <div className="no-scrollbar -mx-5 mb-10 flex gap-1 overflow-x-auto px-5 sm:mx-0 sm:mb-14 sm:px-0" role="tablist">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={filter === cat}
              onClick={() => setFilter(cat)}
              className={cn(
                "relative shrink-0 rounded-full px-4 py-1.5 text-sm transition-colors duration-300",
                filter === cat ? "text-bg" : "text-muted hover:text-ink",
              )}
            >
              {/* Latar gelap meluncur ke pilihan yang aktif */}
              {filter === cat && (
                <motion.span
                  layoutId="project-filter"
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-ink"
                  transition={{ type: "spring", stiffness: 380, damping: 34 }}
                />
              )}
              <span className="relative">{cat === ALL ? t("projects.all") : cat}</span>
            </button>
          ))}
        </div>
      )}

      {ordered.length === 0 ? (
        <p className="border-t border-line py-12 text-muted">{t("projects.empty")}</p>
      ) : (
        <motion.ul layout className="grid gap-x-6 gap-y-14 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-24">
          <AnimatePresence mode="popLayout">
            {ordered.map((project) => (
              <ProjectTile
                key={project.id}
                project={project}
                number={numbering.indexOf(project) + 1}
                wide={project.featured}
              />
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </Page>
  );
}
