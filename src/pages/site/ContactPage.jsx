import { ChevronRight, FileText, Github, Gitlab, Linkedin, Mail, MessageCircle } from "lucide-react";
import { Page } from "../../components/site/Page";
import { usePortfolio } from "../../lib/portfolio";
import { assetUrl, whatsappLink } from "../../lib/utils";
import { useLang } from "../../i18n/language";

const prettyUrl = (url) => String(url).replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

export default function ContactPage() {
  const { data } = usePortfolio();
  const { t } = useLang();
  const { profile } = data;

  const links = [
    profile.email && { label: "Email", value: profile.email, icon: Mail, href: `mailto:${profile.email}` },
    profile.whatsapp && { label: "WhatsApp", value: profile.whatsapp, icon: MessageCircle, href: whatsappLink(profile.whatsapp) },
    profile.linkedin_url && { label: "LinkedIn", value: prettyUrl(profile.linkedin_url), icon: Linkedin, href: profile.linkedin_url },
    profile.github_url && { label: "GitHub", value: prettyUrl(profile.github_url), icon: Github, href: profile.github_url },
    profile.gitlab_url && { label: "GitLab", value: prettyUrl(profile.gitlab_url), icon: Gitlab, href: profile.gitlab_url },
    profile.cv_url && { label: t("contact.cv"), value: "PDF", icon: FileText, href: assetUrl(profile.cv_url) },
  ].filter(Boolean);

  return (
    <Page narrow>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#7d5a50] to-[#b4846c] p-6 text-white shadow-float animate-gradient sm:p-8 dark:from-[#3b2b26] dark:to-[#7d5a50]">
        <div className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-white/10" />
        <h2 className="relative text-2xl font-bold sm:text-3xl">{t("contact.heading")}</h2>
        <p className="relative mt-1 max-w-md text-white/85">{t("contact.text")}</p>
      </div>

      <p className="mb-3 mt-6 text-sm font-semibold uppercase tracking-wider text-muted">{t("contact.subtitle")}</p>
      <ul className="divide-y divide-line overflow-hidden rounded-3xl bg-surface shadow-card">
        {links.map(({ label, value, icon: Icon, href }) => (
          <li key={label}>
            <a
              href={href}
              {...(href.startsWith("mailto:") ? {} : { target: "_blank", rel: "noreferrer" })}
              className="group flex items-center gap-4 px-4 py-4 transition hover:bg-surface-2 sm:px-5"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand text-on-brand">
                <Icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{label}</span>
                <span className="block truncate text-sm text-muted">{value}</span>
              </span>
              <ChevronRight className="size-5 text-muted transition group-hover:translate-x-1" />
            </a>
          </li>
        ))}
      </ul>
    </Page>
  );
}
