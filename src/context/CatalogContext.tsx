import {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getCatalog } from "../services/catalog";
import type { CatalogResponse } from "../types/product";
import { CatalogContext } from "./catalog-context";

interface CatalogProviderProps {
  children: ReactNode;
}

export function CatalogProvider({ children }: CatalogProviderProps) {
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    getCatalog()
      .then((data) => {
        if (active) setCatalog(data);
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(
            reason instanceof Error ? reason.message : "Error desconocido"
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <CatalogContext.Provider value={{ catalog, loading, error }}>
      {children}
    </CatalogContext.Provider>
  );
}
