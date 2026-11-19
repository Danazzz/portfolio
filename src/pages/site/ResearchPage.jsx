import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { Page } from "../../components/site/Page";
import { Reveal } from "../../components/motion/Reveal";
import { usePortfolio } from "../../lib/portfolio";
import { assetUrl, cn } from "../../lib/utils";
import { EASE } from "../../lib/motion";
import { useLang } from "../../i18n/language";

const linkClass = "group inline-flex items-center gap-0.5 text-accent";

function ArrowOut() {
  return (
    <ArrowUpRight className="size-3.5 transition-transform duration-500 ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
  );
}

function ResearchItem({ item, index, open, onToggle }) {
  const { t, tr } = useLang();
  const title = tr(item, "title");
  const abstract = tr(item, "abstract");
  const status = item.status && item.status !== "published" ? t(`research.status.${item.status}`) : null;

  return (
    <Reveal
      as="li"
      index={index}
      id={`research-${item.id}`}
      className="grid scroll-mt-28 gap-2 border-b border-line py-7 sm:grid-cols-12 sm:gap-8 sm:py-9"
    >
      <div className="flex items-center gap-3 sm:col-span-4 sm:flex-col sm:items-start sm:gap-2 sm:pt-1.5 lg:col-span-3">
        {item.year && <span className="eyebrow tabular-nums">{item.year}</span>}
        {status && (
          <span className="rounded-full border border-line px-2.5 py-0.5 text-xs text-accent">{status}</span>
        )}
      </div>
      <div className="max-w-3xl sm:col-span-8 lg:col-start-5">
        <h2 className="text-xl font-medium leading-snug tracking-[-0.02em] sm:text-[1.75rem] sm:leading-[1.25]">{title}</h2>
        {item.authors && <p className="mt-2 text-muted">{item.authors}</p>}
        {item.venue && <p className="text-muted italic">{item.venue}</p>}
        {item.keywords.length > 0 && <p className="mt-3 text-sm text-muted/80">{item.keywords.join(" · ")}</p>}

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
          {abstract && (
            <button type="button" onClick={onToggle} aria-expanded={open} className="inline-flex items-center gap-1 text-accent">
              <span className="link-line">{t("research.abstract")}</span>
              <ChevronDown className={cn("size-4 transition-transform duration-500 ease-out-expo", open && "rotate-180")} />
            </button>
          )}
          {item.pdf_url && (
            <a href={assetUrl(item.pdf_url)} target="_blank" rel="noreferrer" className={linkClass}>
              <span className="link-line">PDF</span> <ArrowOut />
            </a>
          )}
          {item.doi_url && (
            <a href={item.doi_url} target="_blank" rel="noreferrer" className={linkClass}>
              <span className="link-line">{/doi\.org/.test(item.doi_url) ? "DOI" : t("research.link")}</span> <ArrowOut />
            </a>
          )}
        </div>

        <AnimatePresence initial={false}>
          {open && abstract && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="overflow-hidden"
            >
              <p className="max-w-2xl whitespace-pre-line pt-5 leading-relaxed text-ink/85">{abstract}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Reveal>
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
    <Page title={t("nav.research")} count={data.research.length}>
      {data.research.length === 0 ? (
        <p className="py-4 text-lg text-muted sm:text-xl">{t("research.empty")}</p>
      ) : (
        <ul>
          {data.research.map((item, i) => (
            <ResearchItem key={item.id} item={item} index={i} open={open.has(item.id)} onToggle={() => toggle(item.id)} />
          ))}
        </ul>
      )}
    </Page>
  );
}
