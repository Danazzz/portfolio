import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FileText, Github, Linkedin, Mail, MapPin, MessageCircle } from "lucide-react";
import { assetUrl, whatsappLink } from "../../lib/utils";
import { useLang } from "../../i18n/language";

/** Header coklat melengkung + kartu profil ala kartu dompet digital. */
export function HeroHeader({ profile, stats }) {
  const { t, tr, to } = useLang();
  const headline = tr(profile, "headline");
  const actions = [
    profile.email && { label: "Email", icon: Mail, href: `mailto:${profile.email}` },
    profile.whatsapp && { label: "WhatsApp", icon: MessageCircle, href: whatsappLink(profile.whatsapp) },
    profile.github_url && { label: "GitHub", icon: Github, href: profile.github_url },
    profile.cv_url
      ? { label: "CV", icon: FileText, href: assetUrl(profile.cv_url) }
      : profile.linkedin_url && { label: "LinkedIn", icon: Linkedin, href: profile.linkedin_url },
  ].filter(Boolean);

  return (
    <header id="top" className="relative">
      <div className="relative overflow-hidden rounded-b-[2.5rem] animate-gradient bg-gradient-to-br from-[#7d5a50] via-[#b4846c] to-[#5a4038] text-white dark:from-[#3b2b26] dark:via-[#5a4038] dark:to-[#7d5a50]">
        <div className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-24 right-24 size-56 rounded-full bg-[#fcdec0]/15" />
        <div className="pointer-events-none absolute -left-10 top-24 size-32 rounded-full bg-white/5" />

        <div className="relative mx-auto flex max-w-3xl items-center gap-4 px-4 pb-24 pt-24 sm:gap-6 sm:pb-28 sm:pt-28">
          <motion.img
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            src={assetUrl(profile.avatar_url)}
            alt={profile.name}
            className="size-20 shrink-0 rounded-full bg-[#fcdec0] object-cover ring-4 ring-white/25 sm:size-28"
          />
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="min-w-0"
          >
            <p className="text-sm text-[#fcdec0] sm:text-base">{t("hero.greeting")}</p>
            <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-5xl">{profile.name}</h1>
            {headline && <p className="mt-1 text-sm text-white/85 sm:text-lg">{headline}</p>}
            {profile.location && (
              <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs">
                <MapPin className="size-3.5" /> {profile.location}
              </p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Kartu profil yang "mengambang" di atas header */}
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative mx-auto -mt-16 max-w-3xl px-4"
      >
        <div className="flex flex-col gap-4 rounded-3xl bg-surface p-4 shadow-float sm:flex-row sm:items-center sm:p-5">
          <div className="grid flex-1 grid-cols-3 divide-x divide-line rounded-2xl bg-surface-2 py-1.5 text-center">
            {stats.map((s) => (
              <Link key={s.label} to={to(`/${s.section}`)} className="rounded-xl px-2 py-1.5 transition hover:bg-line/60">
                <p className="text-xl font-bold text-brand sm:text-2xl dark:text-cream">{s.value}</p>
                <p className="text-xs text-muted sm:text-sm">{s.label}</p>
              </Link>
            ))}
          </div>
          {actions.length > 0 && (
            <div className="grid grid-cols-4 gap-2 sm:flex sm:gap-3">
              {actions.map(({ label, icon: Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  {...(href.startsWith("mailto:") ? {} : { target: "_blank", rel: "noreferrer" })}
                  className="group flex flex-col items-center gap-1.5 sm:w-16"
                >
                  <span className="grid size-12 place-items-center rounded-2xl bg-brand text-on-brand shadow-sm transition group-hover:-translate-y-0.5 group-active:scale-95">
                    <Icon className="size-5" strokeWidth={2.2} />
                  </span>
                  <span className="text-xs font-medium">{label}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </header>
  );
}
