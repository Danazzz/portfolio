import { useCallback, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "../components/ui/Button";
import { FeedbackContext } from "./feedback-context";

/** Menyediakan notifikasi singkat (toast) dan dialog konfirmasi untuk panel admin. */
export function FeedbackProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);
  const resolver = useRef(null);

  const toast = useCallback((message, type = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((list) => [...list, { id, message, type }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), type === "error" ? 6000 : 3000);
  }, []);

  const confirm = useCallback(
    (options) =>
      new Promise((resolve) => {
        resolver.current = resolve;
        setDialog(options);
      }),
    [],
  );

  const close = (result) => {
    resolver.current?.(result);
    resolver.current = null;
    setDialog(null);
  };

  const value = useMemo(() => ({ toast, confirm }), [toast, confirm]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      {createPortal(
        <>
          <div className="pointer-events-none fixed inset-x-0 top-3 z-[80] flex flex-col items-center gap-2 px-4">
            <AnimatePresence>
              {toasts.map((t) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  role="status"
                  onClick={() => setToasts((list) => list.filter((x) => x.id !== t.id))}
                  className="pointer-events-auto flex max-w-md cursor-pointer items-center gap-2.5 rounded-2xl bg-espresso px-4 py-3 text-sm font-medium text-white shadow-float"
                >
                  {t.type === "error" ? (
                    <XCircle className="size-5 shrink-0 text-orange-300" />
                  ) : (
                    <CheckCircle2 className="size-5 shrink-0 text-emerald-300" />
                  )}
                  {t.message}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {dialog && (
              <div className="fixed inset-0 z-[90] grid place-items-center p-4" role="alertdialog" aria-modal="true">
                <motion.div
                  className="absolute inset-0 bg-black/50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => close(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative w-full max-w-sm rounded-3xl bg-surface p-6 text-center shadow-float"
                >
                  <span
                    className={`mx-auto mb-3 grid size-14 place-items-center rounded-full ${dialog.danger ? "bg-danger/10 text-danger" : "bg-surface-2 text-brand"}`}
                  >
                    <AlertTriangle className="size-7" />
                  </span>
                  <h2 className="text-lg font-bold">{dialog.title}</h2>
                  {dialog.message && <p className="mt-1 text-muted">{dialog.message}</p>}
                  <div className="mt-6 grid grid-cols-2 gap-2">
                    <Button variant="secondary" onClick={() => close(false)}>
                      {dialog.cancelLabel || "Batal"}
                    </Button>
                    <Button
                      className={dialog.danger ? "!bg-danger !text-white" : ""}
                      onClick={() => close(true)}
                      autoFocus
                    >
                      {dialog.confirmLabel || "Ya, lanjutkan"}
                    </Button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </>,
        document.body,
      )}
    </FeedbackContext.Provider>
  );
}
