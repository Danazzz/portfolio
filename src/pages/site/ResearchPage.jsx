import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { Page } from "../../components/site/Page";
import { usePortfolio } from "../../lib/portfolio";
import { assetUrl, cn } from "../../lib/utils";
import { EASE } from "../../lib/motion";
import { useLang } from "../../i18n/language";

function ResearchItem({ item, open, onToggle }) {
  const { t, tr } = useLang();
  const title = tr(item, "title");
  const abstract = tr(item, "abstract");
  const status = item.status && item.status !== "published" ? t(`research.status.${item.status}`) : null;

  return (
    <li id={`research-${item.id}`} className="grid scroll-mt-24 gap-1 border-b border-line py-6 sm:grid-cols-[12rem_1fr] sm:gap-6">
      <div className="flex items-center gap-2 text-sm tabular-nums text-muted sm:flex-col sm:items-start sm:gap-1.5 sm:pt-1">
        {item.year && <span>{item.year}</span>}
        {status && (
          <span className="rounded-full border border-line px-2 py-0.5 text-xs text-accent">{status}</span>
        )}
      </div>
      <div>
        <h2 className="text-xl font-medium leading-snug tracking-tight sm:text-2xl">{title}</h2>
        {item.authors && <p className="mt-1.5 text-muted">{item.authors}</p>}
        {item.venue && <p className="text-muted italic">{item.venue}</p>}
        {item.keywords.length > 0 && (
          <p className="mt-2 text-sm text-muted/80">{item.keywords.join(" · ")}</p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
          {abstract && (
            <button
              type="button"
              onClick={onToggle}
              aria-expanded={open}
              className="inline-flex items-center gap-1 text-accent hover:underline"
            >
              {t("research.abstract")}
              <ChevronDown className={cn("size-4 transition-transform duration-300", open && "rotate-180")} />
            </button>
          )}
          {item.pdf_url && (
            <a href={assetUrl(item.pdf_url)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-accent hover:underline">
              PDF <ArrowUpRight className="size-3.5" />
            </a>
          )}
          {item.doi_url && (
            <a href={item.doi_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-accent hover:underline">
              {/doi\.org/.test(item.doi_url) ? "DOI" : t("research.link")} <ArrowUpRight className="size-3.5" />
            </a>
          )}
        </div>

        <AnimatePresence initial={false}>
          {open && abstract && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="overflow-hidden"
            >
              <p className="max-w-2xl whitespace-pre-line pt-4 leading-relaxed text-ink/85">{abstract}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </li>
  );
}

/** Daftar penelitian bergaya akademik: tahun & status di kiri, judul + penulis + tautan di kanan. */
export default function ResearchPage() {
  const { data } = usePortfolio();
  const { t } = useLang();
  const { state } = useLocation();
  const [open, setOpen] = useState(() => new Set(state?.open ? [state.open] : []));

  // Dibuka dari pencarian (⌘K) → gulir ke penelitian itu.
  useEffect(() => {
    if (!state?.open) return;
    const id = setTimeout(
      () => document.getElementById(`research-${state.open}`)?.scrollIntoView({ behavior: "smooth", block: "start" }),
      350,
    );
    return () => clearTimeout(id);
  }, [state]);

  const toggle = (id) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <Page title={t("nav.research")}>
      {data.research.length === 0 ? (
        <p className="border-t border-line py-12 text-muted">{t("research.empty")}</p>
      ) : (
        <ul className="border-t border-line">
          {data.research.map((item) => (
            <ResearchItem key={item.id} item={item} open={open.has(item.id)} onToggle={() => toggle(item.id)} />
          ))}
        </ul>
      )}
    </Page>
  );
}
