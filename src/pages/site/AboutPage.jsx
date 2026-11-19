import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Page, SplitSection } from "../../components/site/Page";
import { Lightbox } from "../../components/site/MediaViewer";
import { PointerParallax } from "../../components/motion/Parallax";
import { Reveal, RevealFrame } from "../../components/motion/Reveal";
import { usePortfolio } from "../../lib/portfolio";
import { assetUrl, cn } from "../../lib/utils";
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

/** Baris daftar di kolom kanan: label kecil (tahun/kelompok) di atas, isi di bawah. Muncul berurutan. */
function Row({ index, aside, children }) {
  return (
    <Reveal as="li" index={index} className="border-b border-line py-6 first:pt-1 sm:py-7">
      {aside && <p className="eyebrow mb-2 tabular-nums">{aside}</p>}
      {children}
    </Reveal>
  );
}

const linkClass = "group inline-flex items-center gap-0.5 text-accent";

export default function AboutPage() {
  const { data } = usePortfolio();
  const { t, tr, date } = useLang();
  const { state } = useLocation();
  const { profile, experiences, skills, certificates } = data;
  const [lightbox, setLightbox] = useState(null);

  const headline = tr(profile, "headline");
  // Foto khusus About (potret) jika diisi; jika tidak, pakai foto profil (persegi).
  const photo = profile.about_image_url || profile.avatar_url;
  const about = tr(profile, "about");
  const groups = groupSkills(skills, t("skills.other"));
  const certImages = certificates
    .filter((c) => c.image_url)
    .map((c) => ({ id: c.id, type: "image", url: c.image_url, caption: c.title }));

  // Nomor bagian mengikuti bagian yang benar-benar tampil.
  let section = 0;
  const nextIndex = () => ++section;

  // Datang dari alamat lama (#/skills dll.) → gulir ke bagian itu.
  useEffect(() => {
    if (!state?.part) return;
    const id = setTimeout(() => document.getElementById(state.part)?.scrollIntoView({ behavior: "smooth" }), 350);
    return () => clearTimeout(id);
  }, [state]);

  return (
    <Page title={t("nav.about")}>
      {(about || photo) && (
        <div className="grid gap-10 sm:grid-cols-12 sm:gap-8">
          {photo && (
            // Foto membuka seperti tirai, lalu bergeser pelan di dalam bingkainya mengikuti mouse.
            <RevealFrame
              onView={false}
              delay={0.25}
              className={cn(
                "sm:col-span-4 sm:w-full sm:max-w-80 lg:col-span-3",
                // Foto profil bawaan sudah berbentuk lingkaran (sudutnya transparan) → bingkai bulat.
                profile.about_image_url
                  ? "aspect-[4/5] w-56 rounded-[1.25rem] bg-surface-2 sm:rounded-[1.75rem]"
                  : "aspect-square w-40 rounded-full",
              )}
            >
              <PointerParallax depth={-8} className="h-full w-full scale-[1.12]">
                <img src={assetUrl(photo)} alt={profile.name} loading="lazy" className="h-full w-full object-cover" />
              </PointerParallax>
            </RevealFrame>
          )}
          <div className={cn("max-w-3xl sm:col-span-8", photo ? "lg:col-start-5" : "sm:col-start-5")}>
            {headline && <p className="eyebrow mb-5">{headline}</p>}
            {about && (
              <p className="whitespace-pre-line text-xl leading-relaxed text-ink/90 sm:text-[1.65rem] sm:leading-[1.45] sm:tracking-[-0.01em]">
                {about}
              </p>
            )}
          </div>
        </div>
      )}

      {experiences.length > 0 && (
        <SplitSection id="experience" index={nextIndex()} title={t("nav.experience")} className="mt-24 sm:mt-36">
          <ul>
            {experiences.map((exp, i) => {
              const highlights = tr(exp, "highlights") || [];
              const period = [date(exp.start_date), date(exp.end_date) || t("experience.present")]
                .filter(Boolean)
                .join(" — ");
              return (
                <Row key={exp.id} index={i} aside={exp.start_date || exp.end_date ? period : null}>
                  <h3 className="text-xl font-medium tracking-[-0.015em] sm:text-2xl">
                    {tr(exp, "role")}
                    {exp.organisation && <span className="text-muted"> · {exp.organisation}</span>}
                  </h3>
                  {highlights.length > 0 && (
                    <ul className="mt-3 space-y-1.5 text-ink/80">
                      {highlights.map((h, j) => (
                        <li key={j} className="relative pl-4 leading-relaxed before:absolute before:left-0 before:top-[0.7em] before:size-1 before:rounded-full before:bg-muted">
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}
                </Row>
              );
            })}
          </ul>
        </SplitSection>
      )}

      {skills.length > 0 && (
        <SplitSection id="skills" index={nextIndex()} title={t("nav.skills")} className="mt-24 sm:mt-36">
          <ul>
            {groups.map(([group, items], i) => (
              <Row key={group} index={i} aside={group}>
                {/* flex-wrap: nama skill boleh turun baris di layar sempit */}
                <p className="flex flex-wrap items-baseline gap-x-2 text-xl tracking-[-0.01em] sm:text-2xl">
                  {items.map((s, j) => (
                    <span key={s.id} className="inline-flex items-baseline gap-2">
                      {j > 0 && <span className="text-muted/60">·</span>}
                      {s.name}
                    </span>
                  ))}
                </p>
              </Row>
            ))}
          </ul>
        </SplitSection>
      )}

      {certificates.length > 0 && (
        <SplitSection id="certificates" index={nextIndex()} title={t("nav.certificates")} className="mt-24 sm:mt-36">
          <ul>
            {certificates.map((cert, i) => {
              const imageIndex = certImages.findIndex((m) => m.id === cert.id);
              return (
                <Row key={cert.id} index={i} aside={date(cert.issued_at)}>
                  <h3 className="text-xl font-medium tracking-[-0.015em]">{cert.title}</h3>
                  {cert.issuer && <p className="text-muted">{cert.issuer}</p>}
                  <div className="mt-2 flex flex-wrap gap-x-5 text-sm">
                    {cert.credential_url && (
                      <a href={cert.credential_url} target="_blank" rel="noreferrer" className={linkClass}>
                        <span className="link-line">{t("certificates.view")}</span>
                        <ArrowUpRight className="size-3.5 transition-transform duration-500 ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </a>
                    )}
                    {imageIndex >= 0 && (
                      <button type="button" onClick={() => setLightbox(imageIndex)} className="link-line text-accent">
                        {t("media.view")}
                      </button>
                    )}
                  </div>
                </Row>
              );
            })}
          </ul>
        </SplitSection>
      )}

      {lightbox !== null && <Lightbox media={certImages} index={lightbox} onClose={() => setLightbox(null)} />}
    </Page>
  );
}
