import { ArrowUpRight } from "lucide-react";
import { Page } from "../../components/site/Page";
import { usePortfolio } from "../../lib/portfolio";
import { assetUrl, whatsappLink } from "../../lib/utils";
import { useLang } from "../../i18n/language";

const prettyUrl = (url) => String(url).replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
/** "https://linkedin.com/in/nama" → "nama" */
const handle = (url) => prettyUrl(url).split("/").filter(Boolean).pop() || prettyUrl(url);

export default function ContactPage() {
  const { data } = usePortfolio();
  const { t } = useLang();
  const { profile } = data;

  const links = [
    profile.email && { label: "Email", value: profile.email, href: `mailto:${profile.email}` },
    profile.whatsapp && { label: "WhatsApp", value: profile.whatsapp, href: whatsappLink(profile.whatsapp) },
    profile.linkedin_url && { label: "LinkedIn", value: handle(profile.linkedin_url), href: profile.linkedin_url },
    profile.github_url && { label: "GitHub", value: handle(profile.github_url), href: profile.github_url },
    profile.gitlab_url && { label: "GitLab", value: handle(profile.gitlab_url), href: profile.gitlab_url },
    profile.cv_url && { label: t("contact.cv"), value: "PDF", href: assetUrl(profile.cv_url) },
  ].filter(Boolean);

  return (
    <Page title={t("nav.contact")}>
      <ul className="border-t border-line">
        {links.map(({ label, value, href }) => (
          <li key={label} className="border-b border-line">
            <a
              href={href}
              {...(href.startsWith("mailto:") ? {} : { target: "_blank", rel: "noreferrer" })}
              className="group -mx-3 grid grid-cols-[1fr_auto] items-center gap-x-4 rounded-xl px-3 py-5 transition-colors duration-300 hover:bg-surface-2/70 sm:grid-cols-[12rem_1fr_auto] sm:py-6"
            >
              <span className="text-sm text-muted">{label}</span>
              <span className="col-start-1 row-start-2 min-w-0 truncate text-xl font-medium tracking-tight sm:col-start-2 sm:row-start-1 sm:text-3xl">
                {value}
              </span>
              <ArrowUpRight
                className="row-span-2 size-6 text-muted transition duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent sm:row-span-1"
                strokeWidth={1.6}
              />
            </a>
          </li>
        ))}
      </ul>
    </Page>
  );
}
