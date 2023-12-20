import { createContext } from "react";

import { type Recording } from "@/api/schemas";

const RecordingContext = createContext<Recording | null>(null);

export default RecordingContext;
