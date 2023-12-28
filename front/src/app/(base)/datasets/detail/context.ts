import { createContext } from "react";

import type { Dataset } from "@/types";

const DatasetContext = createContext<Dataset | null>(null);

export default DatasetContext;
