import { Component } from "react";
import { RotateCw } from "lucide-react";
import { logError } from "../lib/errorLog";
import { ErrorDetails } from "./ui/ErrorDetails";

/**
 * Pengaman "layar putih": jika ada komponen yang crash saat ditampilkan,
 * tampilkan pesan + detail teknis + tombol muat ulang, bukan halaman kosong.
 */
export class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    logError(Object.assign(error, { context: info?.componentStack?.split("\n")[1]?.trim() }), "Tampilan crash");
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div className="grid min-h-dvh place-items-center px-5">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-semibold tracking-tight">Something went wrong</h1>
          <p className="mt-1 text-muted">Terjadi kesalahan saat menampilkan halaman ini.</p>
          <p className="mt-4 rounded-xl bg-surface-2 px-3 py-2 font-mono text-sm">{String(error.message || error)}</p>
          <ErrorDetails error={error} className="mt-3" />
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-brand px-5 font-medium text-on-brand"
          >
            <RotateCw className="size-4" /> Reload / Muat ulang
          </button>
        </div>
      </div>
    );
  }
}
