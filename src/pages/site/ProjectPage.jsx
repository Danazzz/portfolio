import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Share } from "lucide-react";
import { MediaViewer } from "../../components/site/MediaViewer";
import { SplitSection } from "../../components/site/Page";
import { Magnetic, MagneticLabel } from "../../components/motion/Magnetic";
import { MaskText, Reveal, RevealFrame } from "../../components/motion/Reveal";
import { usePortfolio } from "../../lib/portfolio";
import { fadeUp } from "../../lib/motion";
import { cn } from "../../lib/utils";
import { useLang } from "../../i18n/language";

const prettyUrl = (url) => String(url).replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

/** Tombol kapsul magnetik: label & ikon ikut bergeser sedikit lebih jauh dari bingkainya. */
const pillClass =
  "group inline-flex h-11 items-center rounded-full border border-line px-5 text-sm font-medium transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-bg focus-visible:border-ink";

function PillLink({ href, children }) {
  return (
    <Magnetic strength={0.3}>
      <a href={href} target="_blank" rel="noreferrer" className={pillClass}>
        <MagneticLabel className="gap-1.5">
          {children}
          <ArrowUpRight className="size-4 transition-transform duration-500 ease-out-expo group-hover:rotate-45" />
        </MagneticLabel>
      </a>
    </Magnetic>
  );
}

function ShareButton({ title }) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* dibatalkan pengguna */
    }
  };
  const Icon = copied ? Check : Share;
  return (
    <Magnetic strength={0.3}>
      <button type="button" onClick={share} className={pillClass}>
        <MagneticLabel className="gap-1.5">
          {copied ? t("project.copied") : t("project.share")}
          <Icon className="size-4" />
        </MagneticLabel>
      </button>
    </Magnetic>
  );
}

function ExternalLink({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-1 text-accent">
      <span className="link-line">{children}</span>
      <ArrowUpRight className="size-4 transition-transform duration-500 ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </a>
  );
}

/** Tautan kembali dengan panah yang mundur sedikit saat disorot. */
function BackLink({ to, children }) {
  return (
    <Link to={to} className="group -ml-0.5 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink">
      <ArrowLeft className="size-4 transition-transform duration-500 ease-out-expo group-hover:-translate-x-1" />
      <span className="link-line">{children}</span>
    </Link>
  );
}

/** Detail proyek bergaya editorial: judul raksasa, tombol aksi, media yang membuka seperti tirai, cerita, spesifikasi. */
export default function ProjectPage() {
  const { slug } = useParams();
  const { data } = usePortfolio();
  const { t, tr, to } = useLang();
  const { projects } = data;

  const index = projects.findIndex((p) => p.slug === slug);
  const project = projects[index];
  const title = project ? tr(project, "title") : "";

  useEffect(() => {
    if (title) document.title = `${title} — ${data.profile.name}`;
  }, [title, data]);

  if (!project) {
    return (
      <div className="frame pt-36 sm:pt-44">
        <h1 className="display text-5xl sm:text-7xl">{t("project.notFound")}</h1>
        <p className="mt-4 text-muted">{t("project.notFoundText")}</p>
        <div className="mt-8">
          <BackLink to={to("/projects")}>{t("project.backHome")}</BackLink>
        </div>
      </div>
    );
  }

  const summary = tr(project, "summary");
  const description = tr(project, "description");
  const role = tr(project, "role");
  const prev = projects[index - 1];
  // Selalu ada "proyek berikutnya": setelah yang terakhir, kembali ke yang pertama.
  const next = projects[index + 1] ?? (projects.length > 1 ? projects[0] : null);
  const meta = [project.category, project.year].filter(Boolean).join(" · ");

  const specs = [
    role && [t("project.role"), role],
    project.year && [t("project.year"), project.year],
    project.category && [t("project.category"), project.category],
    project.tags.length > 0 && [t("project.stack"), project.tags.join(" · ")],
    (project.demo_url || project.source_url) && [
      t("project.links"),
      <span key="links" className="flex flex-col items-start gap-1">
        {project.demo_url && <ExternalLink href={project.demo_url}>{prettyUrl(project.demo_url)}</ExternalLink>}
        {project.source_url && <ExternalLink href={project.source_url}>{prettyUrl(project.source_url)}</ExternalLink>}
      </span>,
    ],
  ].filter(Boolean);

  return (
    <article key={project.id} className="frame pt-24 sm:pt-32">
      <motion.div {...fadeUp()} className="flex flex-wrap items-center justify-between gap-4">
        <BackLink to={to("/projects")}>{t("nav.projects")}</BackLink>
        {meta && <span className="eyebrow">{meta}</span>}
      </motion.div>

      <h1 className="display mt-10 text-[clamp(3rem,12vw,10rem)] sm:mt-14">
        <MaskText text={title} delay={0.1} />
      </h1>

      <div className="mt-8 grid gap-8 sm:mt-12 sm:grid-cols-12 sm:items-end">
        {summary && (
          <motion.p {...fadeUp(0.35)} className="max-w-2xl text-xl leading-snug text-muted sm:col-span-7 sm:text-2xl">
            {summary}
          </motion.p>
        )}
        <motion.div {...fadeUp(0.45)} className="flex flex-wrap gap-2 sm:col-span-5 sm:col-start-8 sm:justify-end">
          {project.demo_url && <PillLink href={project.demo_url}>{t("project.demo")}</PillLink>}
          {project.source_url && <PillLink href={project.source_url}>{t("project.source")}</PillLink>}
          <ShareButton title={title} />
        </motion.div>
      </div>

      <RevealFrame onView={false} delay={0.3} className="mt-12 rounded-[1.25rem] sm:mt-16 sm:rounded-[1.75rem]">
        <MediaViewer media={project.media} mode={project.display_mode} title={title} tags={project.tags} />
      </RevealFrame>

      {description && (
        <SplitSection title={t("project.overview")} index={1} className="mt-20 sm:mt-28">
          <Reveal as="p" className="max-w-3xl whitespace-pre-line text-xl leading-relaxed text-ink/85 sm:text-2xl sm:leading-relaxed">
            {description}
          </Reveal>
        </SplitSection>
      )}

      {specs.length > 0 && (
        <SplitSection title={t("project.specs")} index={description ? 2 : 1} className="mt-20 sm:mt-28">
          <dl className="border-t border-line sm:border-t-0">
            {specs.map(([label, value], i) => (
              <Reveal
                key={label}
                index={i}
                className="grid gap-1 border-b border-line py-4 first:sm:pt-1 sm:grid-cols-[10rem_1fr] sm:gap-6"
              >
                <dt className="text-sm text-muted">{label}</dt>
                <dd>{value}</dd>
              </Reveal>
            ))}
          </dl>
        </SplitSection>
      )}

      {(prev || next) && (
        <nav className="mt-24 border-t border-line pt-6 sm:mt-36 sm:pt-8" aria-label={t("nav.projects")}>
          {prev && (
            <Link
              to={to(`/projects/${prev.slug}`)}
              className="group inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
            >
              <ArrowLeft className="size-4 transition-transform duration-500 ease-out-expo group-hover:-translate-x-1" />
              {t("project.prev")}: <span className="link-line">{tr(prev, "title")}</span>
            </Link>
          )}
          {next && next !== project && (
            <Link to={to(`/projects/${next.slug}`)} className={cn("group block", prev && "mt-10 sm:mt-14")}>
              <span className="eyebrow">{t("project.nextProject")}</span>
              <span className="mt-3 flex items-end justify-between gap-6 sm:mt-5">
                <span className="display block min-w-0 text-[clamp(2.5rem,9vw,8rem)] transition-transform duration-700 ease-out-expo group-hover:translate-x-3 sm:group-hover:translate-x-6">
                  {tr(next, "title")}
                </span>
                <Magnetic strength={0.35} reach={40} className="mb-[0.6vw] shrink-0">
                  <span className="grid size-14 place-items-center rounded-full bg-ink text-bg transition-colors duration-500 group-hover:bg-brand sm:size-24">
                    <ArrowRight className="size-6 transition-transform duration-500 ease-out-expo group-hover:-rotate-45 sm:size-8" />
                  </span>
                </Magnetic>
              </span>
            </Link>
          )}
        </nav>
      )}
    </article>
  );
}
