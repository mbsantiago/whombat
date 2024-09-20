import { z } from "zod";
import { TagSchema } from "./tags";

export const AnnotationProjectSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  annotation_instructions: z.string().nullish(),
  tags: z.array(TagSchema).nullish(),
  created_on: z.coerce.date(),
});
