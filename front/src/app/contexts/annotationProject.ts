import { createContext } from "react";

import type { AnnotationProject } from "@/lib/types";

const AnnotationProjectContext = createContext<AnnotationProject>({
  name: "",
  description: "",
  tags: [],
  created_on: new Date(),
  uuid: "",
});

export default AnnotationProjectContext;
