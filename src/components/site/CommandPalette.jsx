import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CornerDownLeft, Search } from "lucide-react";
import { cn } from "../../lib/utils";
import { useLang } from "../../i18n/language";

const normalize = (s) =>
  String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

/**
 * Kotak pencarian cepat (⌘K / Ctrl+K): pindah halaman atau buka proyek
 * dengan mengetik namanya.
 */
export function CommandPalette({ sections, projects, onClose }) {
  const { t, tr, to } = useLang();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const groups = useMemo(() => {
    const q = normalize(query.trim());
    const match = (...texts) => !q || texts.some((x) => normalize(x).includes(q));
    const pages = ["", ...sections]
      .map((id) => ({ key: `page-${id}`, label: t(id ? `nav.${id}` : "nav.home"), path: id ? `/${id}` : "/" }))
      .filter((item) => match(item.label));
    const items = projects
      .map((p) => ({
        key: `project-${p.id}`,
        label: tr(p, "title"),
        hint: [p.category, ...p.tags].filter(Boolean).slice(0, 3).join(" · "),
        path: `/projects/${p.slug}`,
        search: [p.title, tr(p, "title"), p.category, ...p.tags],
      }))
      .filter((item) => match(...item.search));
    return [
      { title: t("search.pages"), items: pages },
      { title: t("search.projects"), items },
    ].filter((g) => g.items.length);
  }, [query, sections, projects, t, tr]);

  const flat = groups.flatMap((g) => g.items);
  const current = Math.min(index, Math.max(0, flat.length - 1));

  useEffect(() => {
    inputRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  }, [current]);

  const go = (item) => {
    if (!item) return;
    onClose();
    navigate(to(item.path));
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((current + 1) % Math.max(1, flat.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((current - 1 + flat.length) % Math.max(1, flat.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(flat[current]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  let n = -1;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/25 px-4 pt-[12vh] backdrop-blur-sm dark:bg-black/50"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        role="dialog"
        aria-modal="true"
        aria-label={t("search.open")}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_24px_80px_-20px_rgb(43_32_28/0.45)]"
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="size-[18px] shrink-0 text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIndex(0);
            }}
            onKeyDown={onKeyDown}
            placeholder={t("search.placeholder")}
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={flat[current] ? `palette-${flat[current].key}` : undefined}
            className="h-14 w-full bg-transparent text-[16px] outline-none placeholder:text-muted/70"
          />
          <kbd className="hidden rounded-md border border-line px-1.5 py-0.5 font-sans text-[11px] text-muted sm:block">esc</kbd>
        </div>

        <ul id="palette-list" ref={listRef} role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
          {flat.length === 0 && <li className="px-3 py-8 text-center text-sm text-muted">{t("search.empty")}</li>}
          {groups.map((group) => (
            <li key={group.title} role="presentation">
              <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted">{group.title}</p>
              <ul role="presentation">
                {group.items.map((item) => {
                  n += 1;
                  const i = n;
                  const on = i === current;
                  return (
                    <li
                      key={item.key}
                      id={`palette-${item.key}`}
                      role="option"
                      aria-selected={on}
                      onMouseMove={() => setIndex(i)}
                      onClick={() => go(item)}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[15px]",
                        on && "bg-surface-2",
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate">{item.label}</span>
                        {item.hint && <span className="block truncate text-xs text-muted">{item.hint}</span>}
                      </span>
                      {on ? (
                        <CornerDownLeft className="size-4 text-muted" />
                      ) : (
                        <ArrowRight className="size-4 text-muted/40" />
                      )}
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>

        <p className="hidden items-center gap-2 border-t border-line px-4 py-2.5 text-xs text-muted sm:flex">
          <kbd className="rounded border border-line px-1 font-sans">↑</kbd>
          <kbd className="rounded border border-line px-1 font-sans">↓</kbd>
          {t("search.hint")}
        </p>
      </motion.div>
    </motion.div>
  );
}
