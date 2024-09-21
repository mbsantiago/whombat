import type { Dataset } from "@/lib/types";
import { createContext } from "react";

const DatasetContext = createContext<Dataset | null>(null);

export default DatasetContext;
