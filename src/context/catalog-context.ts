import { createContext } from "react";
import type { CatalogResponse } from "../types/product";

interface CatalogContextValue {
  catalog: CatalogResponse | null;
  loading: boolean;
  error: string | null;
}

export const CatalogContext = createContext<CatalogContextValue | null>(null);