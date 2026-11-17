import { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { DownloadCloud, ExternalLink, LogOut } from "lucide-react";
import { supabase } from "../lib/supabase";
import { friendlyError, importSeed, isDatabaseEmpty } from "../lib/api";
import { Button } from "../components/ui/Button";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import { NanasLogo } from "../components/ui/NanasLogo";
import { cn } from "../lib/utils";
import { useConfirm, useToast } from "./feedback-context";
import { ADMIN_TABS, MOBILE_TABS } from "./admin-tabs";


/** Ajakan impor data website lama saat database masih kosong. */
function SeedBanner() {
  const toast = useToast();
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    isDatabaseEmpty().then(setShow).catch(() => setShow(false));
  }, []);

  if (!show) return null;

  const run = async () => {
    setBusy(true);
    try {
      await importSeed();
      toast("Data awal berhasil diimpor!");
      setShow(false);
      window.location.reload();
    } catch (e) {
      toast(friendlyError(e), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mb-5 flex flex-col gap-3 rounded-3xl border-2 border-dashed border-brand-2 bg-surface-2 p-4 sm:flex-row sm:items-center">
      <DownloadCloud className="size-8 shrink-0 text-brand" />
      <div className="flex-1">
        <p className="font-semibold">Database masih kosong</p>
        <p className="text-sm text-muted">
          Salin isi website lama (profil, pengalaman, skill, contoh project) ke database supaya tidak perlu mengetik ulang.
        </p>
      </div>
      <Button onClick={run} loading={busy}>
        Impor data awal
      </Button>
    </div>
  );
}

export function AdminLayout({ email }) {
  const confirm = useConfirm();

  const logout = async () => {
    if (await confirm({ title: "Keluar dari panel admin?", confirmLabel: "Keluar" })) {
      await supabase.auth.signOut();
    }
  };

  return (
    <div className="min-h-dvh pb-28 md:pb-10">
      <header className="bg-gradient-to-br from-[#7d5a50] to-[#b4846c] text-white dark:from-[#3b2b26] dark:to-[#7d5a50]">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-4">
          <span
            className="grid size-10 shrink-0 place-items-center rounded-full bg-[#faf6f1]"
            style={{ "--brand": "#7d5a50", "--brand-2": "#b4846c", "--bg": "#faf6f1" }}
          >
            <NanasLogo className="size-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold leading-tight">Panel Admin</p>
            <p className="truncate text-xs text-white/75">{email}</p>
          </div>
          <Link
            to="/"
            target="_blank"
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-white/15 px-4 text-sm font-medium hover:bg-white/25"
          >
            <ExternalLink className="size-4" /> <span className="hidden sm:inline">Lihat website</span>
          </Link>
          <ThemeToggle className="hover:bg-white/15" />
          <button
            type="button"
            onClick={logout}
            className="grid size-10 place-items-center rounded-full hover:bg-white/15"
            aria-label="Keluar"
            title="Keluar"
          >
            <LogOut className="size-5" />
          </button>
        </div>
        <nav className="mx-auto hidden max-w-5xl gap-1 px-4 pb-3 md:flex" aria-label="Menu admin">
          {ADMIN_TABS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
                  isActive ? "bg-white text-[#3b2b26]" : "text-white/85 hover:bg-white/15",
                )
              }
            >
              <Icon className="size-4" /> {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <SeedBanner />
        <Outlet />
      </main>

      <nav
        aria-label="Menu admin"
        className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pt-2 backdrop-blur-lg md:hidden"
      >
        <ul className="flex">
          {MOBILE_TABS.map(({ to, label, icon: Icon }) => (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center gap-0.5 text-[11px] font-medium",
                    isActive ? "text-brand dark:text-cream" : "text-muted",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={cn("grid h-7 w-12 place-items-center rounded-full", isActive && "bg-surface-2")}>
                      <Icon className="size-5" />
                    </span>
                    {label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
