import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FolderOpen, Images, PlayCircle } from "lucide-react";
import { Section } from "./Section";
import { cn, mediaThumb } from "../../lib/utils";

function ProjectCard({ project }) {
  const navigate = useNavigate();
  const cover = mediaThumb(project.media.find((m) => m.type !== "video") || project.media[0]);
  const hasVideo = project.media.some((m) => m.type !== "image");
  const extraTags = project.tags.length - 3;

  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      type="button"
      onClick={() => navigate(`/project/${project.slug}`)}
      className="group flex flex-col overflow-hidden rounded-3xl bg-surface text-left shadow-card transition hover:-translate-y-1 hover:shadow-float"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-[#b4846c] to-[#7d5a50]">
        {cover ? (
          <img
            src={cover}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="grid h-full place-items-center text-5xl font-bold text-white/70">
            {project.title.charAt(0)}
          </span>
        )}
        {project.media.length > 1 && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
            <Images className="size-3.5" /> {project.media.length}
          </span>
        )}
        {hasVideo && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
            <PlayCircle className="size-3.5" /> Video
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {project.category && (
          <span className="w-fit rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-semibold text-brand dark:text-cream">
            {project.category}
          </span>
        )}
        <h3 className="text-lg font-semibold leading-snug">{project.title}</h3>
        {project.summary && <p className="line-clamp-2 text-sm text-muted">{project.summary}</p>}
        {project.tags.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
            {project.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-lg border border-line px-2 py-0.5 text-xs text-muted">
                {tag}
              </span>
            ))}
            {extraTags > 0 && <span className="px-1 py-0.5 text-xs text-muted">+{extraTags}</span>}
          </div>
        )}
      </div>
    </motion.button>
  );
}

export function ProjectsSection({ projects }) {
  const [filter, setFilter] = useState("All");
  const categories = useMemo(
    () => ["All", ...new Set(projects.map((p) => p.category).filter(Boolean))],
    [projects],
  );
  const visible = filter === "All" ? projects : projects.filter((p) => p.category === filter);

  return (
    <Section id="projects" title="Projects" subtitle="Tap a project to see photos, videos and details">
      {categories.length > 2 && (
        <div className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition",
                filter === cat
                  ? "border-brand bg-brand text-on-brand"
                  : "border-line bg-surface text-ink hover:border-brand-2",
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-line py-12 text-muted">
          <FolderOpen className="size-10" />
          <p>No projects yet — check back soon.</p>
        </div>
      ) : (
        <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </Section>
  );
}
