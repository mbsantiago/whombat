import type { EvaluationSet } from "@/lib/types";
import { createContext } from "react";

const EvaluationSetContext = createContext<EvaluationSet>({
  name: "",
  description: "",
  tags: [],
  uuid: "",
  created_on: new Date(),
  task: "Sound Event Detection",
});

export default EvaluationSetContext;
