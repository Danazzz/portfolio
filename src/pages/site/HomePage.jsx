import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LivingName } from "../../components/site/home/LivingName";
import { CuriousLine } from "../../components/site/home/CuriousLine";
import { LocalTime } from "../../components/site/home/LocalTime";
import { FlutedGlass } from "../../components/site/home/FlutedGlass";
import { MenuRow } from "../../components/site/MenuRow";
import { usePortfolio } from "../../lib/portfolio";
import { availableSections } from "../../lib/sections";
import { EASE } from "../../lib/motion";
import { useLang } from "../../i18n/language";

/**
 * Beranda satu layar.
 *  Desktop: kiri = nama hidup, minat yang berganti, menu besar · kanan = panel abstrak di balik kaca bergaris.
 *  HP: nama → minat → panel → menu.
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
    <section className="mx-auto flex min-h-dvh max-w-6xl flex-col px-5 pt-14 sm:px-8">
      <div className="grid flex-1 content-center gap-x-12 gap-y-8 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:grid-rows-[auto_auto]">
        <div className="flex flex-col gap-6 lg:gap-8 lg:self-end">
          <LivingName name={profile.name} className="lg:text-[clamp(3.4rem,min(7.4vw,12vh),7.25rem)]" />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: EASE }}
          >
            <CuriousLine key={lang} label={t("home.curious")} items={interests} />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative lg:col-start-2 lg:row-span-2 lg:row-start-1"
        >
          <FlutedGlass className="h-[42vh] min-h-[280px] w-full lg:h-[min(76vh,700px)]" />
        </motion.div>

        <nav aria-label="Main" className="lg:col-start-1 lg:row-start-2 lg:self-start">
          <ul className="border-t border-line">
            {sections.map((id, i) => (
              <motion.li
                key={id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + i * 0.07, ease: EASE }}
                className="border-b border-line"
              >
                <MenuRow to={to(`/${id}`)} label={t(`nav.${id}`)} />
              </motion.li>
            ))}
          </ul>
        </nav>
      </div>

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
