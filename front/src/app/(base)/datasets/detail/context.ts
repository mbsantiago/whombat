import { createContext } from "react";
import { type Dataset } from '@/api/schemas';

const DatasetContext = createContext<Dataset | null>(null);

export default DatasetContext;
