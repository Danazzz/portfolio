import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Check, Code2, ExternalLink, SearchX, Share2 } from "lucide-react";
import { Sheet } from "../ui/Sheet";
import { Button } from "../ui/Button";
import { Skeleton } from "../ui/Skeleton";
import { MediaViewer } from "./MediaViewer";
import { usePortfolio } from "../../lib/portfolio";

function ShareButton({ title }) {
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
      {copied ? "Link copied" : "Share"}
    </Button>
  );
}

/** Detail project dalam bottom sheet; alamatnya bisa dibagikan (#/project/slug). */
export function ProjectSheet() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, data } = usePortfolio();
  const [open, setOpen] = useState(true);

  const project = data?.projects.find((p) => p.slug === slug);

  useEffect(() => {
    if (!project) return;
    const prev = document.title;
    document.title = `${project.title} — ${data.profile.name}`;
    return () => {
      document.title = prev;
    };
  }, [project, data]);

  const goBack = () => {
    // Kembali ke halaman sebelumnya jika berasal dari website ini, kalau tidak ke beranda.
    if (location.key !== "default") navigate(-1);
    else navigate("/", { replace: true });
  };

  return (
    <Sheet open={open} onClose={() => setOpen(false)} onExited={goBack} label={project?.title || "Project"} size="lg">
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
          <p className="text-lg font-semibold">Project not found</p>
          <p className="text-muted">It may have been moved or removed.</p>
          <Button onClick={() => setOpen(false)}>Back to home</Button>
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
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{project.title}</h2>
              {project.summary && <p className="mt-1 text-muted sm:text-lg">{project.summary}</p>}
            </header>

            <div className="flex flex-wrap gap-2">
              {project.demo_url && (
                <Button icon={ExternalLink} href={project.demo_url}>
                  Live demo
                </Button>
              )}
              {project.source_url && (
                <Button variant="secondary" icon={Code2} href={project.source_url}>
                  Source code
                </Button>
              )}
              <ShareButton title={project.title} />
            </div>

            {project.description && (
              <section>
                <h3 className="mb-2 font-semibold">About this project</h3>
                <p className="whitespace-pre-line leading-relaxed text-ink/85">{project.description}</p>
              </section>
            )}

            {project.tags.length > 0 && (
              <section>
                <h3 className="mb-2 font-semibold">Built with</h3>
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
