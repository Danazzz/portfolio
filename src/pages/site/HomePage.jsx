import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LivingName } from "../../components/site/home/LivingName";
import { CuriousLine } from "../../components/site/home/CuriousLine";
import { LocalTime } from "../../components/site/home/LocalTime";
import { PreferenceToggles } from "../../components/site/SiteHeader";
import { PointerParallax } from "../../components/motion/Parallax";
import { RevealRule } from "../../components/motion/Reveal";
import { InteractiveParticleMorph } from "../../components/particles/InteractiveParticleMorph";
import { NANAS_LOGO } from "../../components/particles/nanasShape";
import { useMediaQuery } from "../../lib/hooks";
import { usePortfolio } from "../../lib/portfolio";
import { fadeUp } from "../../lib/motion";
import { useLang } from "../../i18n/language";

// Urutan bentuk patung partikel di beranda: patung organik → kisi gyroid → logo nanas → torus.
const HERO_SHAPES = ["sculpture", "lattice", NANAS_LOGO, "torus"];

/** Letak & ukuran patung partikel per lebar layar (pusat dalam -1..1, jari-jari relatif sisi terpendek). */
function useHeroPlacement() {
  const desktop = useMediaQuery("(min-width: 1024px)");
  const tablet = useMediaQuery("(min-width: 640px)");
  if (desktop) return { center: [0.44, -0.02], fit: 0.34 };
  if (tablet) return { center: [0.38, -0.32], fit: 0.3 };
  return { center: [0.12, -0.6], fit: 0.27 };
}

/**
 * Beranda satu layar bergaya sampul majalah:
 *  - patung partikel 3D besar di kanan (di belakang konten), nama besar menimpanya seperti judul sampul
 *  - nama selebar halaman, lalu garis tipis yang tergambar di bawahnya
 *  - di bawah garis (kolom kiri): lokasi & jam, lalu "Currently curious about ___"
 * Nama dan kalimat minat berada di "kedalaman" berbeda: saat mouse bergerak keduanya
 * bergeser berlawanan arah dengan sedikit inersia; partikel tersibak oleh kursor.
 * Navigasi cukup lewat header.
 */
export default function HomePage() {
  const { data } = usePortfolio();
  const { t, tr, lang } = useLang();
  const { profile } = data;
  const placement = useHeroPlacement();

  const interests = useMemo(
    () => (tr(profile, "interests") || []).map((s) => s.trim()).filter(Boolean),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [profile, lang],
  );

  return (
    <div className="relative isolate">
      {/* Patung partikel: di belakang konten, tidak menangkap klik maupun gulir */}
      <InteractiveParticleMorph
        shapes={HERO_SHAPES}
        color="var(--brand)"
        accentColor="var(--brand-2)"
        center={placement.center}
        fit={placement.fit}
        className="absolute inset-0 -z-10"
      />
      <section className="frame flex min-h-dvh flex-col pt-14 sm:pt-16">
        <div className="flex flex-1 flex-col justify-center py-12 sm:py-16">
          <PointerParallax depth={-12}>
            <LivingName
              name={profile.name}
              className="text-[clamp(3.5rem,17.5vw,7rem)] sm:text-[clamp(4rem,12vw,15rem)]"
            />
          </PointerParallax>
          <RevealRule className="mt-6 sm:mt-9" delay={0.55} />

          {/* Kolom kiri saja: kolom kanan menjadi ruang bagi patung partikel */}
          <div className="mt-6 grid gap-y-8 sm:mt-8 sm:grid-cols-12 sm:gap-x-8">
            <motion.p {...fadeUp(0.85)} className="eyebrow flex items-center gap-2 sm:col-[1/8]">
              {profile.location && <span>{profile.location}</span>}
              {profile.location && profile.timezone && <span aria-hidden="true">·</span>}
              <LocalTime timezone={profile.timezone} />
            </motion.p>
            <PointerParallax depth={7} className="sm:col-[1/8] lg:col-[1/6]">
              <motion.div {...fadeUp(0.75)}>
                <CuriousLine key={lang} label={t("home.curious")} items={interests} />
              </motion.div>
            </PointerParallax>
          </div>
        </div>

        {/* pr: beri ruang untuk tombol kontak melayang di kanan bawah */}
        <motion.footer
          {...fadeUp(0.95)}
          className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-5 pr-20 text-xs text-muted sm:py-6 sm:pr-24"
        >
          {/* HP: bahasa & tema pindah ke sini (di desktop ada di header) */}
          <PreferenceToggles className="-my-1 -ml-2.5 w-full md:hidden" />
          <div className="flex items-center gap-4">
            <span className="whitespace-nowrap">
              © {new Date().getFullYear()} {profile.name}
            </span>
            <Link to="/admin" className="link-line text-muted/50 transition-colors hover:text-muted">
              Admin
            </Link>
          </div>
        </motion.footer>
      </section>
    </div>
  );
}
