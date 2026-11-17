import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Page, ScrollText, SectionTitle } from "../../components/site/Page";
import { Reveal } from "../../components/motion/Reveal";
import { Lightbox } from "../../components/site/MediaViewer";
import { usePortfolio } from "../../lib/portfolio";
import { assetUrl } from "../../lib/utils";
import { scrollToElement } from "../../lib/smoothScroll";
import { useLang } from "../../i18n/language";

/** Kelompokkan skill sesuai kategori; "Lainnya" selalu paling akhir. */
const groupSkills = (skills, otherLabel) => {
  const groups = new Map();
  skills.forEach((skill) => {
    const key = skill.category?.trim() || otherLabel;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(skill);
  });
  const entries = [...groups.entries()];
  return [...entries.filter(([k]) => k !== otherLabel), ...entries.filter(([k]) => k === otherLabel)];
};

/** Baris daftar: kolom kiri kecil (tahun/kelompok), kolom kanan isi. */
function Row({ aside, children, i = 0 }) {
  return (
    <Reveal
      as="li"
      delay={Math.min(i, 6) * 0.05}
      y={16}
      className="grid gap-1 border-b border-line py-5 sm:grid-cols-[12rem_1fr] sm:gap-6"
    >
      <div className="text-sm tabular-nums text-muted sm:pt-0.5">{aside}</div>
      <div>{children}</div>
    </Reveal>
  );
}

export default function AboutPage() {
  const { data } = usePortfolio();
  const { t, tr, date } = useLang();
  const { state } = useLocation();
  const { profile, experiences, skills, certificates } = data;
  const [lightbox, setLightbox] = useState(null);

  const headline = tr(profile, "headline");
  const about = tr(profile, "about");
  const groups = groupSkills(skills, t("skills.other"));
  const certImages = certificates
    .filter((c) => c.image_url)
    .map((c) => ({ id: c.id, type: "image", url: c.image_url, caption: c.title }));

  // Datang dari alamat lama (#/skills dll.) → gulir ke bagian itu.
  useEffect(() => {
    if (!state?.part) return;
    const id = setTimeout(() => scrollToElement(document.getElementById(state.part)), 350);
    return () => clearTimeout(id);
  }, [state]);

  return (
    <Page title={t("nav.about")}>
      {(about || profile.about_image_url) && (
        <div className="grid gap-8 sm:grid-cols-[1fr_auto] sm:gap-12">
          <div className="max-w-2xl">
            {headline && <p className="mb-4 text-sm font-medium text-accent">{headline}</p>}
            {about && (
              <ScrollText
                key={about}
                text={about}
                className="whitespace-pre-line text-xl leading-relaxed text-ink sm:text-2xl sm:leading-relaxed"
              />
            )}
          </div>
          {profile.about_image_url && (
            <img
              src={assetUrl(profile.about_image_url)}
              alt={profile.name}
              loading="lazy"
              className="aspect-[4/5] w-full max-w-60 rounded-2xl object-cover sm:w-60"
            />
          )}
        </div>
      )}

      {experiences.length > 0 && (
        <section className="mt-20 sm:mt-28">
          <SectionTitle id="experience">{t("nav.experience")}</SectionTitle>
          <ul>
            {experiences.map((exp, i) => {
              const highlights = tr(exp, "highlights") || [];
              const period = [date(exp.start_date), date(exp.end_date) || t("experience.present")]
                .filter(Boolean)
                .join(" — ");
              return (
                <Row key={exp.id} i={i} aside={exp.start_date || exp.end_date ? period : null}>
                  <h3 className="text-lg font-medium">
                    {tr(exp, "role")}
                    {exp.organisation && <span className="text-muted"> · {exp.organisation}</span>}
                  </h3>
                  {highlights.length > 0 && (
                    <ul className="mt-2 space-y-1.5 text-ink/80">
                      {highlights.map((h, i) => (
                        <li
                          key={i}
                          className="relative pl-4 leading-relaxed before:absolute before:left-0 before:top-[0.7em] before:size-1 before:rounded-full before:bg-muted"
                        >
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}
                </Row>
              );
            })}
          </ul>
        </section>
      )}

      {skills.length > 0 && (
        <section className="mt-20 sm:mt-28">
          <SectionTitle id="skills">{t("nav.skills")}</SectionTitle>
          <ul>
            {groups.map(([group, items], i) => (
              <Row key={group} i={i} aside={group}>
                <p className="text-lg">
                  {items.map((s, i) => (
                    <span key={s.id}>
                      {i > 0 && <span className="px-2 text-muted/60">·</span>}
                      {s.name}
                    </span>
                  ))}
                </p>
              </Row>
            ))}
          </ul>
        </section>
      )}

      {certificates.length > 0 && (
        <section className="mt-20 sm:mt-28">
          <SectionTitle id="certificates">{t("nav.certificates")}</SectionTitle>
          <ul>
            {certificates.map((cert, i) => {
              const imageIndex = certImages.findIndex((m) => m.id === cert.id);
              return (
                <Row key={cert.id} i={i} aside={date(cert.issued_at)}>
                  <h3 className="text-lg font-medium">{cert.title}</h3>
                  {cert.issuer && <p className="text-muted">{cert.issuer}</p>}
                  <div className="mt-1 flex flex-wrap gap-x-5 text-sm">
                    {cert.credential_url && (
                      <a
                        href={cert.credential_url}
                        target="_blank"
                        rel="noreferrer"
                        className="link-underline inline-flex items-center gap-0.5 text-accent"
                      >
                        {t("certificates.view")} <ArrowUpRight className="size-3.5" />
                      </a>
                    )}
                    {imageIndex >= 0 && (
                      <button
                        type="button"
                        onClick={() => setLightbox(imageIndex)}
                        className="link-underline text-accent"
                      >
                        {t("media.view")}
                      </button>
                    )}
                  </div>
                </Row>
              );
            })}
          </ul>
        </section>
      )}

      {lightbox !== null && <Lightbox media={certImages} index={lightbox} onClose={() => setLightbox(null)} />}
    </Page>
  );
}
