import { createContext } from "react";

import {
  type AnnotationProject,
  type Tag,
  type EvaluationSet,
} from "@/api/schemas";
import { type EvaluationSetUpdate } from "@/api/evaluation_sets";

export const AnnotationProjectContext = createContext<AnnotationProject>({
  name: "",
  description: "",
  tags: [],
  created_on: new Date(),
  uuid: "",
});

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
