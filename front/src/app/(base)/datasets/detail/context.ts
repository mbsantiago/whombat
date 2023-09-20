import { createContext } from "react";

import { type Dataset, type DatasetUpdate } from "@/api/datasets";

type DatasetContextType = {
  dataset: Dataset | null;
  isLoading: boolean;
  onChange?: (dataset: DatasetUpdate) => void;
  onDelete?: () => void;
  downloadLink?: string;
};

export const DatasetContext = createContext<DatasetContextType>({
  dataset: null,
  isLoading: true,
});
