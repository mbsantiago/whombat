import { z } from "zod";

import * as schemas from "@/lib/schemas";

export type Tag = z.infer<typeof schemas.TagSchema>;

export type TagFilter = z.infer<typeof schemas.TagFilterSchema>;

export type AnnotationTag = z.infer<typeof schemas.TagAssociationSchema>;

export type PredictionTag = z.infer<typeof schemas.PredictionTagSchema>;
