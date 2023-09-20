import { createContext } from "react";

import { type AnnotationProject } from "@/api/annotation_projects";

export const AnnotationProjectContext = createContext<AnnotationProject | null>(
  null,
);
