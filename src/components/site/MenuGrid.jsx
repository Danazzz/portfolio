import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Award, Briefcase, Check, Code2, Github, LayoutGrid, Linkedin, MessageCircle, Share2, UserRound,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useLang } from "../../i18n/language";

const TONES = [
  "bg-[#7d5a50] text-white",
  "bg-[#fcdec0] text-[#7d5a50]",
  "bg-[#b4846c] text-white",
  "bg-[#3b2b26] text-[#fcdec0] dark:bg-[#fcdec0] dark:text-[#3b2b26]",
];

const ICONS = {
  projects: LayoutGrid,
  experience: Briefcase,
  skills: Code2,
  certificates: Award,
  about: UserRound,
  contact: MessageCircle,
};

/** Menu utama beranda: ikon bulat seperti layanan di aplikasi super-app. */
export function MenuGrid({ profile, sections, counts }) {
  const { t, to } = useLang();
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: profile.name, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* dibatalkan pengguna */
    }
  };

  const items = [
    ...sections.map((id) => ({ key: id, to: to(`/${id}`), label: t(`nav.${id}`), icon: ICONS[id], badge: counts[id] })),
    profile.github_url && { key: "github", href: profile.github_url, label: "GitHub", icon: Github },
    profile.linkedin_url && { key: "linkedin", href: profile.linkedin_url, label: "LinkedIn", icon: Linkedin },
    { key: "share", onClick: share, label: copied ? t("nav.copied") : t("nav.share"), icon: copied ? Check : Share2 },
  ]
    .filter(Boolean)
    .slice(0, 8);

  return (
    <nav aria-label={t("home.menu")} className="mx-auto max-w-3xl px-4 pt-8">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">{t("home.menu")}</h2>
      <ul className="grid grid-cols-4 gap-x-2 gap-y-6">
        {items.map((item, i) => {
          const Icon = item.icon;
          const isMain = item.key === "projects";
          const tile = (
            <>
              <span
                className={cn(
                  "relative grid size-14 place-items-center rounded-full shadow-sm transition group-hover:-translate-y-1 group-active:scale-90 sm:size-16",
                  TONES[i % TONES.length],
                  isMain && "ring-4 ring-[#fcdec0] dark:ring-[#7d5a50]",
                )}
              >
                <Icon className="size-6 sm:size-7" strokeWidth={2} />
                {item.badge > 0 && (
                  <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-surface px-1 text-[11px] font-bold text-brand ring-2 ring-brand dark:text-cream">
                    {item.badge}
                  </span>
                )}
              </span>
              <span className={cn("text-center text-xs sm:text-sm", isMain ? "font-bold" : "font-medium")}>{item.label}</span>
            </>
          );
          const cls = "group flex w-full flex-col items-center gap-2";
          return (
            <motion.li
              key={item.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.04 }}
            >
              {item.to ? (
                <Link to={item.to} className={cls}>
                  {tile}
                </Link>
              ) : item.href ? (
                <a href={item.href} target="_blank" rel="noreferrer" className={cls}>
                  {tile}
                </a>
              ) : (
                <button type="button" onClick={item.onClick} className={cls}>
                  {tile}
                </button>
              )}
            </motion.li>
          );
        })}
      </ul>
    </nav>
  );
}
