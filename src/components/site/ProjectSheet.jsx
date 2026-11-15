import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Check, Code2, ExternalLink, SearchX, Share2 } from "lucide-react";
import { Sheet } from "../ui/Sheet";
import { Button } from "../ui/Button";
import { Skeleton } from "../ui/Skeleton";
import { MediaViewer } from "./MediaViewer";
import { usePortfolio } from "../../lib/portfolio";
import { useLang } from "../../i18n/language";

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
  return (
    <Button variant="outline" icon={copied ? Check : Share2} onClick={share}>
      {copied ? t("project.copied") : t("project.share")}
    </Button>
  );
}

/** Detail project dalam bottom sheet; alamatnya bisa dibagikan (#/project/slug). */
export function ProjectSheet() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, data } = usePortfolio();
  const { t, tr, to } = useLang();
  const [open, setOpen] = useState(true);

  const project = data?.projects.find((p) => p.slug === slug);
  const title = project ? tr(project, "title") : "";
  const summary = project ? tr(project, "summary") : "";
  const description = project ? tr(project, "description") : "";

  useEffect(() => {
    if (!title) return;
    const prev = document.title;
    document.title = `${title} — ${data.profile.name}`;
    return () => {
      document.title = prev;
    };
  }, [title, data]);

  const goBack = () => {
    // Kembali ke halaman sebelumnya jika berasal dari website ini, kalau tidak ke beranda.
    if (location.key !== "default") navigate(-1);
    else navigate(to("/"), { replace: true });
  };

  return (
    <Sheet open={open} onClose={() => setOpen(false)} onExited={goBack} closeLabel={t("common.close")} label={title || "Project"} size="lg">
      {status === "loading" && (
        <div className="space-y-4 p-5 pt-14">
          <Skeleton className="aspect-video" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-20" />
        </div>
      )}

      {status !== "loading" && !project && (
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <SearchX className="size-12 text-muted" />
          <p className="text-lg font-semibold">{t("project.notFound")}</p>
          <p className="text-muted">{t("project.notFoundText")}</p>
          <Button onClick={() => setOpen(false)}>{t("project.backHome")}</Button>
        </div>
      )}

      {project && (
        <article>
          <MediaViewer media={project.media} mode={project.display_mode} />
          <div className="space-y-5 p-5 sm:p-7">
            <header>
              {project.category && (
                <span className="mb-2 inline-block rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold text-brand dark:text-cream">
                  {project.category}
                </span>
              )}
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
              {summary && <p className="mt-1 text-muted sm:text-lg">{summary}</p>}
            </header>

            <div className="flex flex-wrap gap-2">
              {project.demo_url && (
                <Button icon={ExternalLink} href={project.demo_url}>
                  {t("project.demo")}
                </Button>
              )}
              {project.source_url && (
                <Button variant="secondary" icon={Code2} href={project.source_url}>
                  {t("project.source")}
                </Button>
              )}
              <ShareButton title={title} />
            </div>

            {description && (
              <section>
                <h3 className="mb-2 font-semibold">{t("project.about")}</h3>
                <p className="whitespace-pre-line leading-relaxed text-ink/85">{description}</p>
              </section>
            )}

            {project.tags.length > 0 && (
              <section>
                <h3 className="mb-2 font-semibold">{t("project.builtWith")}</h3>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-surface-2 px-3 py-1.5 text-sm font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        </article>
      )}
    </Sheet>
  );
}
