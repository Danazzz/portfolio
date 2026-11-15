import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, LogIn, LockKeyhole } from "lucide-react";
import { supabase } from "../lib/supabase";
import { friendlyError } from "../lib/api";
import { Button } from "../components/ui/Button";
import { TextInput } from "./fields";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) setError(friendlyError(error));
    setBusy(false);
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="relative overflow-hidden rounded-b-[2.5rem] bg-gradient-to-br from-[#7d5a50] to-[#b4846c] px-6 pb-24 pt-10 text-white dark:from-[#3b2b26] dark:to-[#7d5a50]">
        <div className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-white/10" />
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-white/85 hover:text-white">
          <ArrowLeft className="size-4" /> Kembali ke website
        </Link>
        <h1 className="mt-8 text-3xl font-bold">Panel Admin</h1>
        <p className="text-white/85">Masuk untuk mengelola isi portfolio Anda.</p>
      </div>

      <form
        onSubmit={submit}
        className="relative mx-4 -mt-14 space-y-4 rounded-3xl bg-surface p-6 shadow-float sm:mx-auto sm:w-full sm:max-w-md"
      >
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-surface-2 text-brand">
          <LockKeyhole className="size-7" />
        </span>
        <TextInput
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nama@email.com"
        />
        <div className="relative">
          <TextInput
            label="Password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pr-12"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute bottom-2 right-2 grid size-9 place-items-center rounded-full text-muted hover:bg-surface-2"
            aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
          >
            {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        </div>
        {error && <p className="rounded-2xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger">{error}</p>}
        <Button type="submit" size="lg" icon={LogIn} loading={busy} className="w-full">
          Masuk
        </Button>
      </form>
    </div>
  );
}
