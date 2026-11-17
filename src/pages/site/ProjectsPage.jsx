import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, PlayCircle } from "lucide-react";
import { Page } from "../../components/site/Page";
import { ProjectCover } from "../../components/site/ProjectCover";
import { usePortfolio } from "../../lib/portfolio";
import { cn, mediaThumb } from "../../lib/utils";
import { useLang } from "../../i18n/language";

const ALL = "__all__";

/** Tile proyek: gambar besar, lalu judul + tahun + ringkasan. */
function ProjectTile({ project, wide }) {
  const { tr, to } = useLang();
  const title = tr(project, "title");
  const summary = tr(project, "summary");
  const cover = mediaThumb(project.media.find((m) => m.type !== "video"));
  const hasVideo = project.media.some((m) => m.type !== "image");

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn(wide && "sm:col-span-2")}
    >
      <Link to={to(`/projects/${project.slug}`)} className="group block">
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl bg-surface-2 sm:rounded-3xl",
            wide ? "aspect-[16/10] sm:aspect-[2/1]" : "aspect-[16/10]",
          )}
        >
          {cover ? (
            <img
              src={cover}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <ProjectCover title={title} size={wide ? "lg" : "md"} className="transition duration-700 ease-out group-hover:scale-[1.03]" />
          )}
          {hasVideo && (
            <PlayCircle className="absolute right-4 top-4 size-6 text-white drop-shadow" strokeWidth={1.6} aria-label="Video" />
          )}
        </div>
        <div className="mt-4 flex items-baseline justify-between gap-4">
          <h2 className={cn("font-semibold tracking-tight", wide ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl")}>
            {title}
            <ChevronRight className="ml-0.5 inline size-[0.8em] -translate-y-px text-muted transition group-hover:translate-x-1 group-hover:text-accent" />
          </h2>
          {project.year && <span className="shrink-0 text-sm tabular-nums text-muted">{project.year}</span>}
        </div>
        {summary && <p className="mt-1 max-w-2xl text-muted">{summary}</p>}
      </Link>
    </motion.li>
  );
}

export default function ProjectsPage() {
  const { data } = usePortfolio();
  const { t } = useLang();
  const { projects } = data;
  const [filter, setFilter] = useState(ALL);
  const categories = useMemo(
    () => [ALL, ...new Set(projects.map((p) => p.category).filter(Boolean))],
    [projects],
  );
  const visible = filter === ALL ? projects : projects.filter((p) => p.category === filter);
  // Proyek unggulan tampil lebar di urutan atas.
  const ordered = [...visible.filter((p) => p.featured), ...visible.filter((p) => !p.featured)];

  return (
    <Page title={t("nav.projects")}>
      {categories.length > 2 && (
        <div className="no-scrollbar -mx-5 mb-8 flex gap-1 overflow-x-auto px-5 sm:mx-0 sm:px-0" role="tablist">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={filter === cat}
              onClick={() => setFilter(cat)}
              className={cn(
                "shrink-0 rounded-full px-4 py-1.5 text-sm transition",
                filter === cat ? "bg-ink text-bg" : "text-muted hover:bg-surface-2 hover:text-ink",
              )}
            >
              {cat === ALL ? t("projects.all") : cat}
            </button>
          ))}
        </div>
      )}

      {ordered.length === 0 ? (
        <p className="border-t border-line py-12 text-muted">{t("projects.empty")}</p>
      ) : (
        <motion.ul layout className="grid gap-x-6 gap-y-12 sm:grid-cols-2 sm:gap-y-16">
          <AnimatePresence mode="popLayout">
            {ordered.map((project) => (
              <ProjectTile key={project.id} project={project} wide={project.featured} />
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </Page>
  );
}
