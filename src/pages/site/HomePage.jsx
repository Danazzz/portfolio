import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LivingName } from "../../components/site/home/LivingName";
import { CuriousLine } from "../../components/site/home/CuriousLine";
import { LocalTime } from "../../components/site/home/LocalTime";
import { PineapplePanel } from "../../components/site/home/PineapplePanel";
import { HomeTiles } from "../../components/site/home/HomeTiles";
import { MagneticButton } from "../../components/motion/MagneticButton";
import { usePortfolio } from "../../lib/portfolio";
import { availableSections } from "../../lib/sections";
import { EASE } from "../../lib/motion";
import { mediaThumb } from "../../lib/utils";
import { useLang } from "../../i18n/language";

const rise = (delay) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease: EASE },
});

/**
 * Beranda (terinspirasi komposisi zeewrk):
 *  kiri  = eyebrow minat · nama besar · "Currently curious about ___" · tombol magnetik · lokasi & jam
 *  kanan = panel nanas di balik kaca bergaris + 3 tile navigasi
 * Tidak ada daftar proyek di sini — proyek tampil di menu Projects.
 */
export default function HomePage() {
  const { data } = usePortfolio();
  const { t, tr, to, lang } = useLang();
  const { profile, projects } = data;
  const sections = availableSections(data);

  const interests = useMemo(
    () => (tr(profile, "interests") || []).map((s) => s.trim()).filter(Boolean),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [profile, lang],
  );
  const city = (profile.location || "").split(",").pop().trim();
  const eyebrow = [interests.slice(0, 3).join(" · "), city].filter(Boolean).join(" — ");
  const firstCover = projects.map((p) => mediaThumb(p.media.find((m) => m.type !== "video"))).find(Boolean);

  const tiles = sections.map((id) => ({
    kind: id,
    to: to(`/${id}`),
    label: t(`nav.${id}`),
    cover: id === "projects" ? firstCover : null,
  }));
  const secondary = sections.includes("research") ? "research" : "about";

  return (
    <section className="mx-auto grid min-h-dvh max-w-6xl gap-x-12 gap-y-10 px-5 pb-8 pt-20 sm:px-8 lg:grid-cols-[1fr_1.02fr] lg:pb-6 lg:pt-20">
      {/* ---------- kiri ---------- */}
      <div className="flex flex-col lg:py-6">
        <div className="flex flex-1 flex-col justify-center gap-7">
          {eyebrow && (
            <motion.p {...rise(0.05)} className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
              {eyebrow}
            </motion.p>
          )}
          <LivingName name={profile.name} className="font-display lg:text-[clamp(3.4rem,min(7vw,12vh),7rem)]" />
          <motion.div {...rise(0.25)}>
            <CuriousLine key={lang} label={t("home.curious")} items={interests} />
          </motion.div>
          <motion.div {...rise(0.4)} className="flex flex-wrap items-center gap-3">
            <MagneticButton to={to("/projects")}>{t("home.cta.projects")}</MagneticButton>
            <MagneticButton to={to(`/${secondary}`)} variant="outline" arrow={false}>
              {t(`nav.${secondary}`)}
            </MagneticButton>
          </motion.div>
        </div>

        <motion.div {...rise(0.55)} className="mt-10 border-t border-dashed border-line pt-5 text-xs text-muted">
          <p className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-pine" />
            {profile.location && <span>{profile.location}</span>}
            {profile.location && profile.timezone && <span aria-hidden="true">·</span>}
            <LocalTime timezone={profile.timezone} />
          </p>
          <p className="mt-1.5 flex items-center gap-4 pr-20 sm:pr-0">
            <span>
              © {new Date().getFullYear()} {profile.name}
            </span>
            <Link to="/admin" className="text-muted/50 transition hover:text-muted">
              Admin
            </Link>
          </p>
        </motion.div>
      </div>

      {/* ---------- kanan ---------- */}
      <div className="flex flex-col gap-3">
        <PineapplePanel
          interests={interests}
          label={city ? `nanas — ${city}` : "nanas"}
          projectsHref={to("/projects")}
          className="aspect-[4/5] w-full sm:aspect-[5/4] lg:aspect-auto lg:min-h-[520px] lg:flex-1"
        >
          {/* desktop: tile berada di dalam panel, menempel di bawah (seperti zeewrk) */}
          <HomeTiles items={tiles} className="absolute inset-x-4 bottom-4 z-20 hidden lg:grid" />
        </PineapplePanel>
        {/* HP/tablet: tile di bawah panel */}
        <HomeTiles items={tiles} className="lg:hidden" />
      </div>
    </section>
  );
}
