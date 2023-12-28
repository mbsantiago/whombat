import { createContext } from "react";

import { type EvaluationSetUpdate } from "@/api/evaluation_sets";

import type { EvaluationSet, Tag } from "@/types";

type EvaluationSetContextType = {
  evaluationSet: EvaluationSet;
  update?: (data: EvaluationSetUpdate) => Promise<EvaluationSet>;
  delete?: () => Promise<EvaluationSet>;
  addTag?: (tag: Tag) => Promise<EvaluationSet>;
  removeTag?: (tag: Tag) => Promise<EvaluationSet>;
};

export const EvaluationSetContext = createContext<EvaluationSetContextType>({
  evaluationSet: {
    name: "",
    description: "",
    tags: [],
    uuid: "",
    created_on: new Date(),
  },
});
