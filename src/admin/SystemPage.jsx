import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, ClipboardCopy, Loader2, RotateCw, Trash2, XCircle } from "lucide-react";
import { Button } from "../components/ui/Button";
import { ErrorDetails } from "../components/ui/ErrorDetails";
import { clearErrorLog, getErrorLog } from "../lib/errorLog";
import { cn } from "../lib/utils";
import { PageHeader } from "./PageHeader";
import { runSystemCheck } from "./system-check";
import { useToast } from "./feedback-context";

const ICONS = {
  ok: { icon: CheckCircle2, cls: "text-emerald-600 dark:text-emerald-400" },
  warn: { icon: AlertTriangle, cls: "text-amber-600 dark:text-amber-400" },
  fail: { icon: XCircle, cls: "text-danger" },
};

const formatTime = (iso) =>
  new Date(iso).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" });

function ResultRow({ result }) {
  const { icon: Icon, cls } = ICONS[result.status];
  return (
    <li className="flex gap-3 border-b border-line py-3 last:border-0">
      <Icon className={cn("mt-0.5 size-5 shrink-0", cls)} />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{result.label}</p>
        {result.detail && <p className="break-words text-sm text-muted">{result.detail}</p>}
        {result.fix && (
          <p className="mt-1 rounded-xl bg-surface-2 px-3 py-2 text-sm">
            <b>Cara memperbaiki:</b> {result.fix}
          </p>
        )}
        {result.error && <ErrorDetails error={result.error} labels={{ details: "Detail teknis", copy: "Salin", copied: "Tersalin" }} className="mt-2" />}
      </div>
    </li>
  );
}

/** Admin → Cek Sistem: periksa konfigurasi & database, plus catatan error terakhir. */
export function SystemPage() {
  const toast = useToast();
  const [results, setResults] = useState([]);
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState(getErrorLog);

  const run = useCallback(async () => {
    setRunning(true);
    setResults([]);
    await runSystemCheck(setResults);
    setRunning(false);
  }, []);

  useEffect(() => {
    run();
  }, [run]);

  const failed = results.filter((r) => r.status === "fail").length;
  const warned = results.filter((r) => r.status === "warn").length;

  const copyReport = async () => {
    const lines = [
      `Cek Sistem — ${new Date().toISOString()}`,
      ...results.map((r) => `[${r.status.toUpperCase()}] ${r.label}: ${r.detail || ""}${r.fix ? ` → ${r.fix}` : ""}`),
      "",
      "Log error:",
      JSON.stringify(log, null, 2),
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      toast("Laporan disalin.");
    } catch {
      toast("Gagal menyalin. Browser tidak mengizinkan akses clipboard.", "error");
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Cek Sistem"
        description="Memeriksa koneksi, kunci, tabel database dan penyimpanan file."
        action={
          <Button icon={RotateCw} variant="secondary" onClick={run} loading={running}>
            Periksa ulang
          </Button>
        }
      />

      <div
        className={cn(
          "rounded-3xl p-4 font-semibold",
          running ? "bg-surface-2" : failed ? "bg-danger/10 text-danger" : warned ? "bg-amber-500/10 text-amber-700 dark:text-amber-300" : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        )}
      >
        {running ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" /> Memeriksa…
          </span>
        ) : failed ? (
          `${failed} masalah perlu diperbaiki.`
        ) : warned ? (
          `Semua berjalan, dengan ${warned} catatan.`
        ) : (
          "Semua berjalan normal. ✓"
        )}
      </div>

      <section className="rounded-3xl bg-surface px-4 shadow-card sm:px-5">
        <ul>
          {results.map((r) => (
            <ResultRow key={r.label} result={r} />
          ))}
        </ul>
      </section>

      <section className="rounded-3xl bg-surface p-4 shadow-card sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-bold">Log error</h2>
            <p className="text-sm text-muted">20 error terakhir di browser ini (website & panel admin).</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" icon={ClipboardCopy} onClick={copyReport}>
              Salin laporan
            </Button>
            <Button
              size="sm"
              variant="ghost"
              icon={Trash2}
              onClick={() => {
                clearErrorLog();
                setLog([]);
              }}
              disabled={!log.length}
            >
              Hapus log
            </Button>
          </div>
        </div>
        {log.length === 0 ? (
          <p className="rounded-2xl bg-surface-2 px-4 py-6 text-center text-sm text-muted">Belum ada error tercatat.</p>
        ) : (
          <ul className="space-y-2">
            {log.map((entry, i) => (
              <li key={`${entry.time}-${i}`} className="rounded-2xl border border-line p-3">
                <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted">
                  <span>{formatTime(entry.time)}</span>
                  <span>·</span>
                  <span>{entry.where}</span>
                  <span>·</span>
                  <span className="font-mono">{entry.page}</span>
                  {(entry.code || entry.status) && (
                    <span className="rounded bg-surface-2 px-1.5 font-mono">{entry.code || `HTTP ${entry.status}`}</span>
                  )}
                </p>
                <p className="mt-1 break-words font-mono text-sm">{entry.message}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
