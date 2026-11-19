import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Versi "opsz": di ukuran besar Inter otomatis memakai potongan Display yang lebih rapat dan tegas.
import "@fontsource-variable/inter/opsz.css";
import "./index.css";
import App from "./App.jsx";
import { installGlobalErrorHandlers } from "./lib/errorLog";

installGlobalErrorHandlers();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
