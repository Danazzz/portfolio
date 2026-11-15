import { createContext, useContext } from "react";

export const PortfolioContext = createContext(null);

/** { status: "loading" | "ready" | "error", data, error, reload } */
export const usePortfolio = () => useContext(PortfolioContext);
