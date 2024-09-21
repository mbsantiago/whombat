import type { AnnotationProject } from "@/lib/types";
import { createContext } from "react";

const AnnotationProjectContext = createContext<AnnotationProject>({
  name: "",
  description: "",
  tags: [],
  created_on: new Date(),
  uuid: "",
});

export default AnnotationProjectContext;
