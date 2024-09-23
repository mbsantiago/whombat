import { z } from "zod";

import * as schemas from "@/lib/schemas";

export type GetManyQuery = z.infer<typeof schemas.GetManySchema>;

export type Paginated<T> = {
  items: T[];
  total: number;
  limit: number;
  offset: number;
};

export type GetMany<T extends object> = T & GetManyQuery;

export type User = z.infer<typeof schemas.UserSchema>;

export type Tag = z.infer<typeof schemas.TagSchema>;

export type TagFilter = z.infer<typeof schemas.TagFilterSchema>;

export type Feature = z.infer<typeof schemas.FeatureSchema>;

export type Note = z.infer<typeof schemas.NoteSchema>;

export type NoteCreate = z.infer<typeof schemas.NoteCreateSchema>;

export type NoteUpdate = z.input<typeof schemas.NoteUpdateSchema>;

export type NoteFilter = z.infer<typeof schemas.NoteFilterSchema>;

export type Dataset = z.infer<typeof schemas.DatasetSchema>;

export type DatasetFilter = z.input<typeof schemas.DatasetFilterSchema>;

export type DatasetCreate = z.input<typeof schemas.DatasetCreateSchema>;

export type DatasetUpdate = z.input<typeof schemas.DatasetUpdateSchema>;

export type DatasetImport = z.infer<typeof schemas.DatasetImportSchema>;

export type SoundEvent = z.infer<typeof schemas.SoundEventSchema>;

export type Clip = z.infer<typeof schemas.ClipSchema>;

export type AnnotationTag = z.infer<typeof schemas.TagAssociationSchema>;

export type ClipAnnotation = z.infer<typeof schemas.ClipAnnotationSchema>;

export type ClipAnnotationFilter = z.infer<
  typeof schemas.ClipAnnotationFilterSchema
>;

export type ClipAnnotationTag = z.infer<typeof schemas.ClipAnnotationTagSchema>;

export type ClipAnnotationTagFilter = z.infer<
  typeof schemas.ClipAnnotationTagFilterSchema
>;

export type ClipAnnotationNote = z.infer<
  typeof schemas.ClipAnnotationNoteSchema
>;

export type ClipAnnotationNoteFilter = z.infer<
  typeof schemas.ClipAnnotationNoteFilterSchema
>;

export type AnnotationStatus = z.infer<typeof schemas.AnnotationStatusSchema>;

export type AnnotationStatusBadge = z.infer<
  typeof schemas.AnnotationStatusBadgeSchema
>;

export type AnnotationTask = z.infer<typeof schemas.AnnotationTaskSchema>;

export type AnnotationProject = z.infer<typeof schemas.AnnotationProjectSchema>;

export type AnnotationProjectFilter = z.infer<
  typeof schemas.AnnotationProjectFilterSchema
>;

export type AnnotationProjectCreate = z.input<
  typeof schemas.AnnotationProjectCreateSchema
>;

export type AnnotationProjectUpdate = z.input<
  typeof schemas.AnnotationProjectUpdateSchema
>;

export type AnnotationProjectImport = z.infer<
  typeof schemas.AnnotationProjectImportSchema
>;

export type PredictionTag = z.infer<typeof schemas.PredictionTagSchema>;

export type SoundEventPrediction = z.infer<
  typeof schemas.SoundEventPredictionSchema
>;

export type ClipPrediction = z.infer<typeof schemas.ClipPredictionSchema>;

export type ModelRun = z.infer<typeof schemas.ModelRunSchema>;

export type UserRun = z.infer<typeof schemas.UserRunSchema>;

export type SoundEventEvaluation = z.infer<
  typeof schemas.SoundEventEvaluationSchema
>;

export type ClipEvaluation = z.infer<typeof schemas.ClipEvaluationSchema>;

export type Evaluation = z.infer<typeof schemas.EvaluationSchema>;

export type EvaluationSet = z.infer<typeof schemas.EvaluationSetSchema>;

export type EvaluationSetFilter = z.infer<
  typeof schemas.EvaluationSetFilterSchema
>;

export type EvaluationSetCreate = z.input<
  typeof schemas.EvaluationSetCreateSchema
>;

export type EvaluationSetUpdate = z.input<
  typeof schemas.EvaluationSetUpdateSchema
>;

export type EvaluationSetImport = z.infer<
  typeof schemas.EvaluationSetImportSchema
>;

export type SpectrogramParameters = z.infer<
  typeof schemas.SpectrogramParametersSchema
>;

export type AudioSettings = z.infer<typeof schemas.AudioSettingsSchema>;

export type SpectrogramSettings = z.infer<
  typeof schemas.SpectrogramSettingsSchema
>;

export type JSONValue = string | number | boolean | JSONObject | JSONArray;

export interface JSONObject {
  [x: string]: JSONValue;
}

export type JSONArray = Array<JSONValue>;

export type DateFilter = z.input<typeof schemas.DateFilterSchema>;

export type TimeFilter = z.input<typeof schemas.TimeFilterSchema>;

export type NumberFilter = z.input<typeof schemas.NumberFilterSchema>;

export type StringFilter = z.input<typeof schemas.StringFilterSchema>;

export type PredictedTagFilter = z.input<
  typeof schemas.PredictedTagFilterSchema
>;

export type IntegerFilter = z.input<typeof schemas.IntegerFilterSchema>;

export type Shortcut = {
  label: string;
  shortcut: string;
  description: string;
};

export type * from "./handlers";
export type * from "./spectrogram";
export type * from "./annotation";
export type * from "./geometry";
export type * from "./sound_event_annotations";
export type * from "./viewport";
export type * from "./canvas";
export type * from "./recording";
export type * from "./audio";
