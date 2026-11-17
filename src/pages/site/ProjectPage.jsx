import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Check, ChevronLeft, ChevronRight, Share } from "lucide-react";
import { MediaViewer } from "../../components/site/MediaViewer";
import { RevealTitle, SectionTitle } from "../../components/site/Page";
import { usePortfolio } from "../../lib/portfolio";
import { fadeUp } from "../../lib/motion";
import { useLang } from "../../i18n/language";

const prettyUrl = (url) => String(url).replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

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
    <button type="button" onClick={share} className="inline-flex items-center gap-1.5 text-accent hover:underline">
      {copied ? t("project.copied") : t("project.share")}
      <Icon className="size-4" />
    </button>
  );
}

function ExternalLink({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-accent hover:underline">
      {children}
      <ArrowUpRight className="size-4" />
    </a>
  );
}

/** Detail proyek seperti halaman produk: judul, link, media, cerita, lalu tabel spesifikasi. */
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
      <div className="mx-auto max-w-6xl px-5 pt-36 sm:px-8">
        <h1 className="text-4xl font-semibold tracking-tight">{t("project.notFound")}</h1>
        <p className="mt-2 text-muted">{t("project.notFoundText")}</p>
        <Link to={to("/projects")} className="mt-6 inline-flex items-center gap-1 text-accent hover:underline">
          {t("project.backHome")} <ChevronRight className="size-4" />
        </Link>
      </div>
    );
  }

  const summary = tr(project, "summary");
  const description = tr(project, "description");
  const role = tr(project, "role");
  const prev = projects[index - 1];
  const next = projects[index + 1];

  const specs = [
    role && [t("project.role"), role],
    project.year && [t("project.year"), project.year],
    project.category && [t("project.category"), project.category],
    project.tags.length > 0 && [t("project.stack"), project.tags.join(" · ")],
    (project.demo_url || project.source_url) && [
      t("project.links"),
      <span key="links" className="flex flex-col gap-1">
        {project.demo_url && <ExternalLink href={project.demo_url}>{prettyUrl(project.demo_url)}</ExternalLink>}
        {project.source_url && <ExternalLink href={project.source_url}>{prettyUrl(project.source_url)}</ExternalLink>}
      </span>,
    ],
  ].filter(Boolean);

  return (
    <article key={project.id} className="mx-auto max-w-6xl px-5 pt-24 sm:px-8 sm:pt-28">
      <motion.div {...fadeUp()}>
        <Link
          to={to("/projects")}
          className="-ml-1 inline-flex items-center gap-0.5 text-sm text-muted transition hover:text-ink"
        >
          <ChevronLeft className="size-4" /> {t("nav.projects")}
        </Link>
        <RevealTitle text={title} className="mt-6 text-5xl font-semibold tracking-[-0.035em] sm:text-7xl" />
        {summary && <p className="mt-4 max-w-2xl text-xl text-muted sm:text-2xl">{summary}</p>}
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
          {project.demo_url && <ExternalLink href={project.demo_url}>{t("project.demo")}</ExternalLink>}
          {project.source_url && <ExternalLink href={project.source_url}>{t("project.source")}</ExternalLink>}
          <ShareButton title={title} />
        </div>
      </motion.div>

      <motion.div {...fadeUp(0.1)} className="mt-10 overflow-hidden rounded-2xl sm:mt-14 sm:rounded-3xl">
        <MediaViewer media={project.media} mode={project.display_mode} title={title} tags={project.tags} />
      </motion.div>

      {description && (
        <motion.p
          {...fadeUp(0.15)}
          className="mt-12 max-w-2xl whitespace-pre-line text-lg leading-relaxed text-ink/85 sm:mt-16 sm:text-xl"
        >
          {description}
        </motion.p>
      )}

      {specs.length > 0 && (
        <section className="mt-16 sm:mt-20">
          <SectionTitle>{t("project.specs")}</SectionTitle>
          <dl>
            {specs.map(([label, value]) => (
              <div key={label} className="grid gap-1 border-b border-line py-4 sm:grid-cols-[12rem_1fr] sm:gap-6">
                <dt className="text-sm text-muted">{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {(prev || next) && (
        <nav className="mt-16 grid grid-cols-2 gap-4 border-t border-line pt-6 sm:mt-20" aria-label={t("nav.projects")}>
          <div>
            {prev && (
              <Link to={to(`/projects/${prev.slug}`)} className="group block">
                <span className="flex items-center gap-0.5 text-sm text-muted">
                  <ChevronLeft className="size-4" /> {t("project.prev")}
                </span>
                <span className="mt-1 block font-medium transition group-hover:text-accent">{tr(prev, "title")}</span>
              </Link>
            )}
          </div>
          <div className="text-right">
            {next && (
              <Link to={to(`/projects/${next.slug}`)} className="group block">
                <span className="flex items-center justify-end gap-0.5 text-sm text-muted">
                  {t("project.next")} <ChevronRight className="size-4" />
                </span>
                <span className="mt-1 block font-medium transition group-hover:text-accent">{tr(next, "title")}</span>
              </Link>
            )}
          </div>
        </nav>
      )}
    </article>
  );
}
