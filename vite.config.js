import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Website di-hosting di https://danazzz.github.io/portfolio/
// jadi semua aset harus diawali "/portfolio/".
export default defineConfig({
  base: "/portfolio/",
  plugins: [react(), tailwindcss()],
});
