import { useMemo } from "react";
import { Page } from "../../components/site/Page";
import { CodeCard } from "../../components/site/CodeCard";
import { usePortfolio } from "../../lib/portfolio";
import { assetUrl } from "../../lib/utils";
import { useLang } from "../../i18n/language";

export default function AboutPage() {
  const { data } = usePortfolio();
  const { t, tr, lang } = useLang();
  const { profile, skills, projects } = data;

  const variable = (profile.name || "me").split(/\s+/)[0].toLowerCase().replace(/[^a-z0-9_]/g, "") || "me";
  const headline = tr(profile, "headline");

  // Isi kartu kode dibuat otomatis dari data profil & skill.
  const entries = useMemo(
    () =>
      [
        ["name", profile.name],
        headline && ["role", headline],
        profile.location && ["location", profile.location],
        skills.length > 0 && ["stack", skills.slice(0, 9).map((s) => s.name)],
        ["projects", projects.length],
        profile.email && ["email", profile.email],
        ["openToWork", true],
      ].filter(Boolean),
    [profile, headline, skills, projects],
  );

  return (
    <Page narrow subtitle={t("about.subtitle")}>
      <CodeCard key={lang} variable={variable} comment={t("about.title")} entries={entries} />
      <div className="mt-5 rounded-3xl bg-surface p-5 shadow-card sm:p-7">
        <p className="whitespace-pre-line leading-relaxed text-ink/90 sm:text-lg">{tr(profile, "about")}</p>
      </div>
      {profile.about_image_url && (
        <img
          src={assetUrl(profile.about_image_url)}
          alt={profile.name}
          loading="lazy"
          className="mt-5 aspect-[4/3] w-full rounded-3xl object-cover shadow-card"
        />
      )}
    </Page>
  );
}
