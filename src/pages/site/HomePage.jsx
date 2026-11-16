import { HeroHeader } from "../../components/site/HeroHeader";
import { MenuGrid } from "../../components/site/MenuGrid";
import { usePortfolio } from "../../lib/portfolio";
import { availableSections } from "../../lib/sections";
import { useLang } from "../../i18n/language";

/** Beranda yang bersih: profil singkat + menu. Isi tiap menu ada di halamannya sendiri. */
export default function HomePage() {
  const { data } = usePortfolio();
  const { t } = useLang();
  const { profile, projects, experiences, skills, certificates } = data;

  const stats = [
    { section: "projects", label: t("stats.projects"), value: projects.length },
    { section: "experience", label: t("stats.experiences"), value: experiences.length },
    certificates.length
      ? { section: "certificates", label: t("stats.certificates"), value: certificates.length }
      : { section: "skills", label: t("stats.skills"), value: skills.length },
  ];

  return (
    <>
      <HeroHeader profile={profile} stats={stats} />
      <MenuGrid
        profile={profile}
        sections={availableSections(data)}
        counts={{ projects: projects.length, certificates: certificates.length }}
      />
    </>
  );
}
