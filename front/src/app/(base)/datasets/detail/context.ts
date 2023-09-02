import { createContext } from "react";
import useDataset from "@/hooks/useDataset";

export const DatasetContext =
  createContext<ReturnType<typeof useDataset> | null>(null);
