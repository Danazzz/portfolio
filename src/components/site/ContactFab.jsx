import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Check, Copy, MessageCircle, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { contactLinks } from "../../lib/contacts";
import { EASE } from "../../lib/motion";
import { useLang } from "../../i18n/language";

function CopyButton({ text, label, copiedLabel }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1800);
    } catch {
      /* clipboard tidak tersedia */
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={done ? copiedLabel : label}
      title={done ? copiedLabel : label}
      className="grid size-9 shrink-0 place-items-center rounded-full text-muted transition hover:bg-surface-2 hover:text-ink"
    >
      {done ? <Check className="size-4" /> : <Copy className="size-4" />}
    </button>
  );
}

/**
 * Tombol kontak melayang (kanan bawah). Diketuk → panel pilihan kontak.
 * Best practice: beri pilihan (WhatsApp, email, LinkedIn…) alih-alih langsung membuka WhatsApp,
 * karena tidak semua pengunjung memakai WhatsApp (mis. recruiter luar negeri, desktop tanpa WA).
 */
export function ContactFab({ profile, open, onOpenChange }) {
  const { t } = useLang();
  const links = contactLinks(profile, t);
  const buttonRef = useRef(null);
  const panelRef = useRef(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (!open) {
      if (wasOpen.current) buttonRef.current?.focus();
      wasOpen.current = false;
      return;
    }
    wasOpen.current = true;
    panelRef.current?.querySelector("a")?.focus({ preventScroll: true });
    const onKey = (e) => e.key === "Escape" && onOpenChange(false);
    const onDown = (e) => {
      if (!panelRef.current?.contains(e.target) && !buttonRef.current?.contains(e.target)) onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open, onOpenChange]);

  if (!links.length) return null;

  return (
    <div className="pointer-events-none fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-40 flex flex-col items-end gap-3 sm:right-8">
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            id="contact-panel"
            role="dialog"
            aria-label={t("contact.title")}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.25, ease: EASE }}
            style={{ transformOrigin: "bottom right" }}
            className="pointer-events-auto w-[min(21rem,calc(100vw-2.5rem))] overflow-hidden rounded-3xl border border-line bg-surface shadow-[0_24px_70px_-20px_rgb(43_32_28/0.45)]"
          >
            <div className="px-5 pb-2 pt-5">
              <p className="text-lg font-semibold tracking-tight">{t("contact.title")}</p>
              <p className="text-sm text-muted">{t("contact.subtitle")}</p>
            </div>
            <ul className="p-2">
              {links.map(({ id, label, value, icon: Icon, href, primary, copy }) => (
                <li key={id} className="flex items-center gap-1">
                  <a
                    href={href}
                    {...(href.startsWith("mailto:") ? {} : { target: "_blank", rel: "noreferrer" })}
                    className="group flex min-w-0 flex-1 items-center gap-3 rounded-2xl px-3 py-2.5 outline-none transition hover:bg-surface-2 focus-visible:bg-surface-2"
                  >
                    <span
                      className={cn(
                        "grid size-10 shrink-0 place-items-center rounded-full",
                        primary ? "bg-[#25d366] text-white" : "bg-surface-2 text-ink",
                      )}
                    >
                      <Icon className="size-[18px]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">{label}</span>
                      <span className="block truncate text-sm text-muted">{value}</span>
                    </span>
                    <ArrowUpRight className="size-4 text-muted transition group-hover:text-accent" />
                  </a>
                  {copy && <CopyButton text={copy} label={t("contact.copy")} copiedLabel={t("contact.copied")} />}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        ref={buttonRef}
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
        aria-controls="contact-panel"
        aria-label={open ? t("menu.close") : t("contact.open")}
        title={t("contact.open")}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8, type: "spring", stiffness: 260, damping: 20 }}
        whileTap={{ scale: 0.92 }}
        className="pointer-events-auto grid size-14 place-items-center rounded-full bg-ink text-bg shadow-[0_12px_32px_-8px_rgb(43_32_28/0.55)] transition-colors hover:bg-brand"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "x" : "chat"}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
