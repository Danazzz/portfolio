import { createContext, useContext } from "react";

export const FeedbackContext = createContext(null);

/** toast("Pesan") / toast("Gagal", "error") */
export const useToast = () => useContext(FeedbackContext).toast;

/** const ok = await confirm({ title, message, confirmLabel, danger }) */
export const useConfirm = () => useContext(FeedbackContext).confirm;
