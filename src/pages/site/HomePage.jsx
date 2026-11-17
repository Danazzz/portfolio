import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LivingName } from "../../components/site/home/LivingName";
import { CuriousLine } from "../../components/site/home/CuriousLine";
import { LocalTime } from "../../components/site/home/LocalTime";
import { PreferenceToggles } from "../../components/site/SiteHeader";
import { usePortfolio } from "../../lib/portfolio";
import { EASE } from "../../lib/motion";
import { useLang } from "../../i18n/language";

/**
 * Beranda satu layar: nama & minat yang berganti di tengah, lokasi & jam di bawah.
 * Navigasi cukup lewat menu di header (juga tampil di HP).
 * Tidak ada proyek di sini — proyek tampil setelah membuka menu Projects.
 */
export default function HomePage() {
  const { data } = usePortfolio();
  const { t, tr, lang } = useLang();
  const { profile } = data;

  const interests = useMemo(
    () => (tr(profile, "interests") || []).map((s) => s.trim()).filter(Boolean),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [profile, lang],
  );

  return (
    <section className="mx-auto flex min-h-dvh max-w-5xl flex-col px-5 pt-14 sm:px-8">
      <div className="flex flex-1 flex-col justify-center gap-8 py-10 sm:gap-10">
        <LivingName name={profile.name} className="sm:text-[clamp(3.4rem,min(12.5vw,17vh),10rem)]" />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: EASE }}
        >
          <CuriousLine key={lang} label={t("home.curious")} items={interests} />
        </motion.div>
      </div>

      {/* pr: beri ruang untuk tombol kontak melayang di kanan bawah */}
      <footer className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-5 pr-20 text-xs text-muted sm:py-6 sm:pr-24">
        <p className="flex w-full items-center gap-2 sm:w-auto">
          {profile.location && <span>{profile.location}</span>}
          {profile.location && profile.timezone && <span aria-hidden="true">·</span>}
          <LocalTime timezone={profile.timezone} />
        </p>
        {/* HP: bahasa & tema pindah ke sini (di desktop ada di header) */}
        <PreferenceToggles className="-my-1 -ml-2.5 w-full md:hidden" />
        <div className="flex items-center gap-4">
          <span className="whitespace-nowrap">
            © {new Date().getFullYear()} {profile.name}
          </span>
          <Link to="/admin" className="text-muted/50 transition hover:text-muted">
            Admin
          </Link>
        </div>
      </footer>
    </section>
  );
}
