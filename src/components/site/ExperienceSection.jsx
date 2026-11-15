import { CalendarDays, Check } from "lucide-react";
import { Section } from "./Section";
import { useLang } from "../../i18n/language";

export function ExperienceSection({ experiences }) {
  const { t, tr, date } = useLang();
  if (!experiences.length) return null;
  return (
    <Section id="experience" title={t("nav.experience")} subtitle={t("experience.subtitle")}>
      <ol className="relative space-y-4 before:absolute before:bottom-4 before:left-[19px] before:top-4 before:w-0.5 before:bg-line">
        {experiences.map((exp, i) => (
          <li key={exp.id} className="relative flex gap-4">
            <span className="relative z-10 grid size-10 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-on-brand ring-4 ring-bg">
              {experiences.length - i}
            </span>
            <div className="flex-1 rounded-3xl bg-surface p-4 shadow-card sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-semibold leading-snug">{tr(exp, "role")}</h3>
                  {exp.organisation && <p className="font-medium text-brand dark:text-cream">{exp.organisation}</p>}
                </div>
                {(exp.start_date || exp.end_date) && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-muted">
                    <CalendarDays className="size-3.5" />
                    {[date(exp.start_date), date(exp.end_date) || t("experience.present")].filter(Boolean).join(" – ")}
                  </span>
                )}
              </div>
              {tr(exp, "highlights").length > 0 && (
                <ul className="mt-3 space-y-2">
                  {tr(exp, "highlights").map((h, j) => (
                    <li key={j} className="flex gap-2 text-sm leading-relaxed text-ink/85">
                      <Check className="mt-0.5 size-4 shrink-0 text-brand-2" strokeWidth={3} />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
