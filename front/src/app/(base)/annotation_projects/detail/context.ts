import { createContext } from "react";
import useAnnotationProject from "@/hooks/useAnnotationProject";

export const AnnotationProjectContext = createContext<ReturnType<
  typeof useAnnotationProject
> | null>(null);
