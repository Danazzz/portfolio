import { Link } from "react-router-dom";
import { Github, Gitlab, Linkedin, Mail, MessageCircle } from "lucide-react";
import { Button } from "../ui/Button";
import { Section } from "./Section";
import { whatsappLink } from "../../lib/utils";
import { useLang } from "../../i18n/language";

export function ContactSection({ profile }) {
  const { t } = useLang();
  const links = [
    profile.email && { label: "Email", icon: Mail, href: `mailto:${profile.email}` },
    profile.whatsapp && { label: "WhatsApp", icon: MessageCircle, href: whatsappLink(profile.whatsapp) },
    profile.linkedin_url && { label: "LinkedIn", icon: Linkedin, href: profile.linkedin_url },
    profile.github_url && { label: "GitHub", icon: Github, href: profile.github_url },
    profile.gitlab_url && { label: "GitLab", icon: Gitlab, href: profile.gitlab_url },
  ].filter(Boolean);

  return (
    <>
      <Section id="contact" title={t("nav.contact")}>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#7d5a50] to-[#b4846c] p-6 text-white shadow-float sm:p-10 dark:from-[#3b2b26] dark:to-[#7d5a50]">
          <div className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-white/10" />
          <h3 className="relative text-2xl font-bold sm:text-3xl">{t("contact.heading")}</h3>
          <p className="relative mt-1 max-w-md text-white/85">
            {t("contact.text")}
          </p>
          <div className="relative mt-6 flex flex-wrap gap-2">
            {links.map(({ label, icon, href }) => (
              <Button key={label} variant="light" icon={icon} href={href}>
                {label}
              </Button>
            ))}
          </div>
        </div>
      </Section>
      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-10 text-sm text-muted">
        <p>
          © {new Date().getFullYear()} {profile.name}
        </p>
        <Link to="/admin" className="rounded-full px-3 py-1 hover:bg-surface-2">
          Admin
        </Link>
      </footer>
    </>
  );
}
