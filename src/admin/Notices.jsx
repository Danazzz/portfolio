import { Link } from "react-router-dom";
import { ArrowLeft, DatabaseZap, LogOut, ShieldAlert } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/Button";

function NoticeCard({ icon: Icon, title, children }) {
  return (
    <div className="grid min-h-dvh place-items-center p-4">
      <div className="w-full max-w-lg space-y-4 rounded-3xl bg-surface p-6 shadow-float">
        <span className="grid size-14 place-items-center rounded-full bg-surface-2 text-brand">
          <Icon className="size-7" />
        </span>
        <h1 className="text-xl font-bold">{title}</h1>
        {children}
      </div>
    </div>
  );
}

/** Tampil jika website belum dihubungkan ke Supabase. */
export function SetupNotice() {
  return (
    <NoticeCard icon={DatabaseZap} title="Panel admin belum terhubung ke database">
      <p className="text-muted">
        Website saat ini memakai data bawaan. Supaya bisa menambah project, foto dan video dari sini,
        hubungkan dulu ke Supabase (gratis). Langkah lengkapnya ada di file <b>README.md</b> bagian
        <b> &quot;Menghubungkan Supabase&quot;</b>.
      </p>
      <ol className="list-decimal space-y-1 pl-5 text-sm text-muted">
        <li>Buat project di supabase.com dan jalankan file supabase/schema.sql.</li>
        <li>Isi VITE_SUPABASE_URL dan VITE_SUPABASE_KEY di GitHub Secrets (dan file .env untuk lokal).</li>
        <li>Deploy ulang website.</li>
      </ol>
      <Button href="#/" variant="secondary" icon={ArrowLeft}>
        Kembali ke website
      </Button>
    </NoticeCard>
  );
}

/** Tampil jika akun berhasil login tapi belum didaftarkan sebagai admin. */
export function NotAdmin({ email }) {
  const sql = `insert into public.admins (user_id)\nselect id from auth.users where email = '${email}'\non conflict do nothing;`;
  return (
    <NoticeCard icon={ShieldAlert} title="Akun ini belum terdaftar sebagai admin">
      <p className="text-muted">
        Anda masuk sebagai <b className="text-ink">{email}</b>. Untuk mengaktifkan akses admin, buka
        Supabase → <b>SQL Editor</b>, tempel perintah di bawah, lalu klik <b>Run</b>. Setelah itu muat ulang halaman ini.
      </p>
      <pre className="overflow-x-auto rounded-2xl bg-espresso p-4 text-xs leading-relaxed text-cream">{sql}</pre>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => navigator.clipboard?.writeText(sql)} variant="secondary">
          Salin perintah
        </Button>
        <Button onClick={() => supabase.auth.signOut()} variant="ghost" icon={LogOut}>
          Keluar
        </Button>
        <Link to="/" className="ml-auto self-center text-sm text-muted hover:text-ink">
          Ke website
        </Link>
      </div>
    </NoticeCard>
  );
}
