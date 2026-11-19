import { createHash } from "node:crypto";
import process from "node:process";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * Content-Security-Policy lewat tag <meta> (GitHub Pages tidak bisa mengatur header).
 * Browser hanya boleh menjalankan skrip dari website ini sendiri, dan hanya terhubung ke
 * Supabase (data, file, login) serta YouTube (video). Skrip sisipan di index.html (pemasang tema)
 * diizinkan lewat hash-nya, yang dihitung otomatis di sini.
 * Hanya dipasang saat build: mode dev Vite memakai skrip sisipan yang akan terblokir.
 */
function contentSecurityPolicy(supabaseUrl) {
  let supabase = "https://*.supabase.co";
  try {
    if (supabaseUrl) supabase = new URL(supabaseUrl).origin;
  } catch {
    /* alamat tidak valid → pakai pola umum Supabase */
  }
  const realtime = supabase.replace(/^https:/, "wss:");
  return {
    name: "content-security-policy",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(html) {
        const hashes = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)]
          .filter(([, code]) => code.trim())
          .map(([, code]) => `'sha256-${createHash("sha256").update(code).digest("base64")}'`);
        const policy = [
          "default-src 'self'",
          `script-src 'self' ${hashes.join(" ")}`.trim(),
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob: https:",
          "media-src 'self' blob: https:",
          "font-src 'self' data:",
          `connect-src 'self' ${supabase} ${realtime} data: blob:`,
          "frame-src https://www.youtube-nocookie.com https://www.youtube.com",
          "worker-src 'self' blob:",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "upgrade-insecure-requests",
        ].join("; ");
        return html.replace(
          "<head>",
          `<head>\n    <meta http-equiv="Content-Security-Policy" content="${policy}" />\n    <meta name="referrer" content="strict-origin-when-cross-origin" />`,
        );
      },
    },
  };
}

// Website di-hosting di https://danazzz.github.io/portfolio/
// jadi semua aset harus diawali "/portfolio/".
export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), "VITE_"), ...process.env };
  return {
    base: "/portfolio/",
    plugins: [react(), tailwindcss(), contentSecurityPolicy(env.VITE_SUPABASE_URL)],
    build: {
      rollupOptions: {
        output: {
          // Pisahkan library besar supaya bisa di-cache browser secara terpisah.
          manualChunks: {
            react: ["react", "react-dom", "react-router-dom"],
            supabase: ["@supabase/supabase-js"],
            motion: ["framer-motion"],
            swiper: ["swiper"],
          },
        },
      },
    },
  };
});
