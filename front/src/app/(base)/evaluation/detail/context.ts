import { createContext } from "react";

import type { EvaluationSet } from "@/types";

const EvaluationSetContext = createContext<EvaluationSet>({
  name: "",
  description: "",
  tags: [],
  uuid: "",
  created_on: new Date(),
});

export default EvaluationSetContext;
