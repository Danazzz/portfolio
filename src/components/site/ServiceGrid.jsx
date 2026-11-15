import { motion } from "framer-motion";
import { useState } from "react";
import {
  Award, Briefcase, Check, Code2, Github, LayoutGrid, Linkedin, MessageCircle, Share2, UserRound,
} from "lucide-react";
import { scrollToSection } from "../../lib/utils";
import { useLang } from "../../i18n/language";

const TONES = [
  "bg-[#7d5a50] text-white",
  "bg-[#fcdec0] text-[#7d5a50]",
  "bg-[#b4846c] text-white",
  "bg-[#3b2b26] text-[#fcdec0] dark:bg-[#fcdec0] dark:text-[#3b2b26]",
];

/** Grid ikon bulat seperti menu layanan di aplikasi super-app. */
export function ServiceGrid({ profile, counts, sections }) {
  const { t } = useLang();
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
    { id: "projects", label: t("nav.projects"), icon: LayoutGrid, badge: counts.projects },
    { id: "experience", label: t("nav.experience"), icon: Briefcase },
    { id: "skills", label: t("nav.skills"), icon: Code2 },
    { id: "certificates", label: t("nav.certificates"), icon: Award, badge: counts.certificates },
    { id: "about", label: t("nav.about"), icon: UserRound },
    { id: "contact", label: t("nav.contact"), icon: MessageCircle },
    profile.github_url && { href: profile.github_url, label: "GitHub", icon: Github },
    profile.linkedin_url && { href: profile.linkedin_url, label: "LinkedIn", icon: Linkedin },
    { label: copied ? t("nav.copied") : t("nav.share"), icon: copied ? Check : Share2, onClick: share },
  ]
    .filter((item) => item && (item.href || item.onClick || sections.includes(item.id)))
    .slice(0, 8);

  return (
    <section aria-label="Quick menu" className="mx-auto max-w-6xl px-4 pt-6">
      <div className="grid grid-cols-4 gap-x-2 gap-y-5 sm:grid-cols-8">
        {items.map((item, i) => {
          const Icon = item.icon;
          const tile = (
            <>
              <span
                className={`relative grid size-14 place-items-center rounded-full shadow-sm transition group-hover:-translate-y-1 group-active:scale-90 sm:size-16 ${TONES[i % TONES.length]}`}
              >
                <Icon className="size-6 sm:size-7" strokeWidth={2} />
                {item.badge > 0 && (
                  <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-surface px-1 text-[11px] font-bold text-brand ring-2 ring-brand dark:text-cream">
                    {item.badge}
                  </span>
                )}
              </span>
              <span className="text-center text-xs font-medium sm:text-sm">{item.label}</span>
            </>
          );
          const cls = "group flex flex-col items-center gap-2";
          return (
            <motion.div
              key={item.id || item.href || "share"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.04 }}
            >
              {item.href ? (
                <a href={item.href} target="_blank" rel="noreferrer" className={cls}>
                  {tile}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={item.onClick || (() => scrollToSection(item.id))}
                  className={`${cls} w-full`}
                >
                  {tile}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
