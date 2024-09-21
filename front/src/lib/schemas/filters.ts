import { z } from "zod";

import { AnnotationProjectSchema } from "./annotation_projects";
import { AnnotationTaskSchema } from "./annotation_tasks";
import { ClipAnnotationSchema } from "./clip_annotations";
import { ClipPredictionSchema } from "./clip_predictions";
import { ClipSchema } from "./clips";
import { TimeStringSchema } from "./common";
import { DatasetSchema } from "./datasets";
import { EvaluationSetSchema } from "./evaluation_sets";
import { EvaluationSchema } from "./evaluations";
import { RecordingSchema } from "./recordings";
import { SoundEventAnnotationSchema } from "./sound_event_annotations";
import { SoundEventPredictionSchema } from "./sound_event_predictions";
import { SoundEventSchema } from "./sound_events";
import { TagSchema } from "./tags";
import { UserSchema } from "./users";

export const FeatureFilterSchema = z.object({
  name: z.string(),
  gt: z.number().optional(),
  lt: z.number().optional(),
});

export const NumberFilterSchema = z.object({
  gt: z.number().optional(),
  lt: z.number().optional(),
  is_null: z.boolean().optional(),
});

export const IntegerFilterSchema = z.object({
  gt: z.number().int().optional(),
  lt: z.number().int().optional(),
  ge: z.number().int().optional(),
  eq: z.number().int().optional(),
  le: z.number().int().optional(),
  is_null: z.boolean().optional(),
});

export const StringFilterSchema = z.object({
  eq: z.string().optional(),
  has: z.string().optional(),
});

export const BooleanFilterSchema = z.object({
  eq: z.boolean().optional(),
});

export const DateFilterSchema = z.object({
  before: z.coerce.date().optional(),
  on: z.coerce.date().optional(),
  after: z.coerce.date().optional(),
  is_null: z.boolean().optional(),
});

export const TimeFilterSchema = z.object({
  before: TimeStringSchema.optional(),
  after: TimeStringSchema.optional(),
  is_null: z.boolean().optional(),
});

export const PredictedTagFilterSchema = z.object({
  tag: TagSchema,
  gt: z.number().optional(),
  lt: z.number().optional(),
});

export const ClipAnnotationFilterSchema = z.object({
  clip: ClipSchema.optional(),
  tag: TagSchema.optional(),
  annotation_project: AnnotationProjectSchema.optional(),
  evaluation_set: EvaluationSetSchema.optional(),
});

export const TagFilterSchema = z.object({
  search: z.string().optional(),
  key: z.string().optional(),
  value: StringFilterSchema.optional(),
  annotation_project: AnnotationProjectSchema.optional(),
  recording: RecordingSchema.optional(),
  sound_event_annotation: SoundEventAnnotationSchema.optional(),
  clip_annotation: ClipAnnotationSchema.optional(),
  sound_event_prediction: SoundEventPredictionSchema.optional(),
  clip_prediction: ClipPredictionSchema.optional(),
  evaluation_set: EvaluationSchema.optional(),
  dataset: DatasetSchema.optional(),
});

export const NoteFilterSchema = z.object({
  is_issue: z.boolean().optional(),
  search: z.string().optional(),
  created_by: UserSchema.optional(),
  recording: RecordingSchema.optional(),
  annotation_task: AnnotationTaskSchema.optional(),
  sound_event: SoundEventSchema.optional(),
  dataset: DatasetSchema.optional(),
});

export const SoundEventAnnotationFilterSchema = z.object({
  annotation_project: AnnotationProjectSchema.optional(),
  recording: RecordingSchema.optional(),
  sound_event: SoundEventSchema.optional(),
  created_by: UserSchema.optional(),
  tag: TagSchema.optional(),
});

export const RecordingTagFilterSchema = z.object({
  recording: RecordingSchema.optional(),
  dataset: DatasetSchema.optional(),
  tag: TagSchema.optional(),
  issue: z.boolean().optional(),
});

export const ClipAnnotationTagFilterSchema = z.object({
  annotation_project: AnnotationProjectSchema.optional(),
  evaluation_set: EvaluationSetSchema.optional(),
});

export const SoundEventAnnotationTagFilterSchema = z.object({
  annotation_project: AnnotationProjectSchema.optional(),
  evaluation_set: EvaluationSetSchema.optional(),
});

export const RecordingNoteFilterSchema = z.object({
  created_by: UserSchema.optional(),
  created_on: DateFilterSchema.optional(),
  recording: RecordingSchema.optional(),
  dataset: DatasetSchema.optional(),
  issues: BooleanFilterSchema.optional(),
});

export const ClipAnnotationNoteFilterSchema = z.object({
  created_by: UserSchema.optional(),
  created_on: DateFilterSchema.optional(),
  issues: BooleanFilterSchema.optional(),
  clip_annotation: ClipAnnotationSchema.optional(),
  annotation_project: AnnotationProjectSchema.optional(),
});

export const SoundEventAnnotationNoteFilterSchema = z.object({
  created_by: UserSchema.optional(),
  created_on: DateFilterSchema.optional(),
  issues: BooleanFilterSchema.optional(),
  sound_event_annotation: SoundEventAnnotationSchema.optional(),
  clip_annotation: ClipAnnotationSchema.optional(),
  annotation_project: AnnotationProjectSchema.optional(),
});

export const EvaluationSetFilterSchema = z.object({
  search: z.string().optional(),
});

export const AnnotationProjectFilterSchema = z.object({
  search: z.string().optional(),
});
