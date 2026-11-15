import { useCallback, useEffect, useState } from "react";
import { fetchPortfolio } from "../../lib/api";
import { PortfolioContext } from "../../lib/portfolio";

export function PortfolioProvider({ children }) {
  const [state, setState] = useState({ status: "loading", data: null, error: null });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, status: "loading", error: null }));
    try {
      const data = await fetchPortfolio();
      setState({ status: "ready", data, error: null });
    } catch (error) {
      console.error(error);
      setState({ status: "error", data: null, error });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <PortfolioContext.Provider value={{ ...state, reload: load }}>{children}</PortfolioContext.Provider>
  );
}
