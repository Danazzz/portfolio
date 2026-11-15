import { Code2 } from "lucide-react";
import { Section } from "./Section";
import { assetUrl } from "../../lib/utils";
import { useLang } from "../../i18n/language";

export function SkillsSection({ skills }) {
  const { t } = useLang();
  if (!skills.length) return null;
  return (
    <Section id="skills" title={t("nav.skills")} subtitle={t("skills.subtitle")}>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {skills.map((skill) => (
          <div
            key={skill.id}
            className="flex flex-col items-center gap-2 rounded-3xl bg-surface p-4 text-center shadow-card transition hover:-translate-y-1"
          >
            <span className="grid size-14 place-items-center rounded-2xl bg-surface-2 p-2.5">
              {skill.icon_url ? (
                <img src={assetUrl(skill.icon_url)} alt="" loading="lazy" className="h-full w-full object-contain" />
              ) : (
                <Code2 className="size-6 text-brand" />
              )}
            </span>
            <span className="text-sm font-medium">{skill.name}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}
