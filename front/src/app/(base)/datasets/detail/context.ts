import { createContext } from "react";

import type { Dataset } from "@/lib/types";

const DatasetContext = createContext<Dataset | null>(null);

export default DatasetContext;
