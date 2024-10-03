import { z } from "zod";

import * as schemas from "@/lib/schemas";

export type SoundEventAnnotation = z.infer<
  typeof schemas.SoundEventAnnotationSchema
>;

export type SoundEventAnnotationCreate = z.input<
  typeof schemas.SoundEventAnnotationCreateSchema
>;

export type SoundEventAnnotationUpdate = z.input<
  typeof schemas.SoundEventAnnotationUpdateSchema
>;

export type SoundEventAnnotationTag = z.infer<
  typeof schemas.SoundEventAnnotationTagSchema
>;

export type SoundEventAnnotationNote = z.infer<
  typeof schemas.SoundEventAnnotationNoteSchema
>;

export type SoundEventAnnotationNoteFilter = z.infer<
  typeof schemas.SoundEventAnnotationNoteFilterSchema
>;

export type SoundEventAnnotationFilter = z.infer<
  typeof schemas.SoundEventAnnotationFilterSchema
>;

export type SoundEventAnnotationTagFilter = z.infer<
  typeof schemas.SoundEventAnnotationTagFilterSchema
>;

export type ScatterPlotData = z.infer<typeof schemas.ScatterPlotDataSchema>;
