import { motion } from "framer-motion";
import { Page } from "../../components/site/Page";
import { usePortfolio } from "../../lib/portfolio";
import { assetUrl } from "../../lib/utils";
import { useLang } from "../../i18n/language";

/** Kelompokkan skill sesuai kategori, urutan mengikuti skill pertama tiap kelompok. */
const groupSkills = (skills, otherLabel) => {
  const groups = new Map();
  skills.forEach((skill) => {
    const key = skill.category?.trim() || otherLabel;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(skill);
  });
  // "Lainnya" selalu paling akhir
  const entries = [...groups.entries()];
  return [...entries.filter(([k]) => k !== otherLabel), ...entries.filter(([k]) => k === otherLabel)];
};

export default function SkillsPage() {
  const { data } = usePortfolio();
  const { t } = useLang();
  const groups = groupSkills(data.skills, t("skills.other"));

  return (
    <Page narrow subtitle={t("skills.subtitle")}>
      <div className="space-y-4">
        {groups.map(([group, skills], i) => (
          <motion.section
            key={group}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="rounded-3xl bg-surface p-4 shadow-card sm:p-5"
          >
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted">
              <span className="size-2 rounded-full bg-brand-2" />
              {group}
              <span className="text-xs font-medium normal-case tracking-normal">· {skills.length}</span>
            </h2>
            <ul className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <li
                  key={skill.id}
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-bg px-4 py-2 text-sm font-medium transition hover:border-brand-2"
                >
                  {skill.icon_url && <img src={assetUrl(skill.icon_url)} alt="" className="size-4 object-contain" />}
                  {skill.name}
                </li>
              ))}
            </ul>
          </motion.section>
        ))}
      </div>
    </Page>
  );
}
