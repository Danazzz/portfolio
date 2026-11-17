import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { LivingName } from "../../components/site/home/LivingName";
import { CuriousLine } from "../../components/site/home/CuriousLine";
import { LocalTime } from "../../components/site/home/LocalTime";
import { usePortfolio } from "../../lib/portfolio";
import { availableSections } from "../../lib/sections";
import { EASE } from "../../lib/motion";
import { useLang } from "../../i18n/language";

/**
 * Beranda satu layar: nama, minat yang berganti, menu besar, lokasi & jam.
 * Tidak ada proyek di sini — proyek tampil setelah membuka menu Projects.
 */
export default function HomePage() {
  const { data } = usePortfolio();
  const { t, tr, to, lang } = useLang();
  const { profile } = data;
  const sections = availableSections(data);

  const interests = useMemo(
    () => (tr(profile, "interests") || []).map((s) => s.trim()).filter(Boolean),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [profile, lang],
  );

  return (
    <section className="mx-auto flex min-h-dvh max-w-5xl flex-col px-5 pt-14 sm:px-8">
      <div className="flex flex-1 flex-col justify-center gap-8 py-10 sm:gap-10">
        <LivingName name={profile.name} />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: EASE }}
        >
          <CuriousLine key={lang} label={t("home.curious")} items={interests} />
        </motion.div>
      </div>

      <nav aria-label="Main">
        <ul className="border-t border-line">
          {sections.map((id, i) => (
            <motion.li
              key={id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + i * 0.07, ease: EASE }}
              className="border-b border-line"
            >
              <Link
                to={to(`/${id}`)}
                className="group -mx-3 flex items-center justify-between rounded-xl px-3 py-4 transition-colors duration-300 hover:bg-surface-2/70 sm:py-[min(1.25rem,2vh)]"
              >
                <span className="text-[clamp(1.75rem,min(4.6vw,5.2vh),3rem)] font-medium tracking-[-0.03em] transition-transform duration-500 ease-out group-hover:translate-x-2">
                  {t(`nav.${id}`)}
                </span>
                <ArrowRight
                  className="size-6 text-muted transition duration-500 ease-out group-hover:translate-x-1 group-hover:text-accent sm:size-7"
                  strokeWidth={1.6}
                />
              </Link>
            </motion.li>
          ))}
        </ul>
      </nav>

      {/* pr: beri ruang untuk tombol kontak melayang di kanan bawah */}
      <footer className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-6 pr-20 text-xs text-muted sm:pr-24">
        <p className="flex items-center gap-2">
          {profile.location && <span>{profile.location}</span>}
          {profile.location && profile.timezone && <span aria-hidden="true">·</span>}
          <LocalTime timezone={profile.timezone} />
        </p>
        <p className="flex items-center gap-4">
          <span>
            © {new Date().getFullYear()} {profile.name}
          </span>
          <Link to="/admin" className="text-muted/50 transition hover:text-muted">
            Admin
          </Link>
        </p>
      </footer>
    </section>
  );
}
