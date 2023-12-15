import { z } from "zod";

export const UserSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  email: z.string().email().optional(),
  name: z.string().optional(),
  created_on: z.coerce.date(),
});

export type User = z.infer<typeof UserSchema>;

export const TagSchema = z.object({
  key: z.string(),
  value: z.string(),
});

export type Tag = z.infer<typeof TagSchema>;

export const FeatureSchema = z.object({
  name: z.string(),
  value: z.number(),
});

export type Feature = z.infer<typeof FeatureSchema>;

export const NoteSchema = z.object({
  uuid: z.string().uuid(),
  message: z.string(),
  is_issue: z.boolean(),
  created_by: UserSchema,
  created_on: z.coerce.date(),
});

export type Note = z.infer<typeof NoteSchema>;

export const RecordingSchema = z.object({
  uuid: z.string().uuid(),
  path: z.string(),
  hash: z.string(),
  duration: z.number(),
  channels: z.number().int(),
  samplerate: z.number().int(),
  time_expansion: z.number().default(1),
  date: z.coerce.date().optional(),
  time: z
    .string()
    .regex(/^\d{2}:\d{2}:\d{2}(\.\d+)?$/)
    .nullable(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  rights: z.string().optional(),
  tags: z.array(TagSchema).optional(),
  features: z.array(FeatureSchema).optional(),
  notes: z.array(NoteSchema).optional(),
  owners: z.array(UserSchema).optional(),
  created_on: z.coerce.date(),
});

export type Recording = z.infer<typeof RecordingSchema>;

export const DatasetSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  audio_dir: z.string(),
  description: z.string(),
  recording_count: z.number().int().default(0),
  created_on: z.coerce.date(),
});

export type Dataset = z.infer<typeof DatasetSchema>;

export const GeometryTypeSchema = z.enum([
  "TimeStamp",
  "TimeInterval",
  "BoundingBox",
  "Point",
  "LineString",
  "Polygon",
  "MultiPoint",
  "MultiLineString",
  "MultiPolygon",
]);

export type GeometryType = z.infer<typeof GeometryTypeSchema>;

export const TimeStampSchema = z.object({
  type: z.literal("TimeStamp"),
  coordinates: z.number(),
});

export type TimeStamp = z.infer<typeof TimeStampSchema>;

export const TimeIntervalSchema = z.object({
  type: z.literal("TimeInterval"),
  coordinates: z.array(z.number()),
});

export type TimeInterval = z.infer<typeof TimeIntervalSchema>;

export const BoundingBoxSchema = z.object({
  type: z.literal("BoundingBox"),
  coordinates: z.array(z.number()),
});

export type BoundingBox = z.infer<typeof BoundingBoxSchema>;

export const PointSchema = z.object({
  type: z.literal("Point"),
  coordinates: z.array(z.number()),
});

export type Point = z.infer<typeof PointSchema>;

export const LineStringSchema = z.object({
  type: z.literal("LineString"),
  coordinates: z.array(z.array(z.number())),
});

export type LineString = z.infer<typeof LineStringSchema>;

export const PolygonSchema = z.object({
  type: z.literal("Polygon"),
  coordinates: z.array(z.array(z.array(z.number()))),
});

export type Polygon = z.infer<typeof PolygonSchema>;

export const MultiPointSchema = z.object({
  type: z.literal("MultiPoint"),
  coordinates: z.array(z.array(z.number())),
});

export type MultiPoint = z.infer<typeof MultiPointSchema>;

export const MultiLineStringSchema = z.object({
  type: z.literal("MultiLineString"),
  coordinates: z.array(z.array(z.array(z.number()))),
});

export type MultiLineString = z.infer<typeof MultiLineStringSchema>;

export const MultiPolygonSchema = z.object({
  type: z.literal("MultiPolygon"),
  coordinates: z.array(z.array(z.array(z.array(z.number())))),
});

export type MultiPolygon = z.infer<typeof MultiPolygonSchema>;

export const GeometrySchema = z.discriminatedUnion("type", [
  TimeStampSchema,
  TimeIntervalSchema,
  BoundingBoxSchema,
  PointSchema,
  LineStringSchema,
  PolygonSchema,
  MultiPointSchema,
  MultiLineStringSchema,
  MultiPolygonSchema,
]);

export type Geometry =
  | TimeStamp
  | TimeInterval
  | BoundingBox
  | Point
  | LineString
  | Polygon
  | MultiPoint
  | MultiLineString
  | MultiPolygon;

export const SoundEventSchema = z.object({
  uuid: z.string().uuid(),
  geometry: GeometrySchema,
  geometry_type: GeometryTypeSchema,
  features: z.array(FeatureSchema).optional(),
  created_on: z.coerce.date(),
});

export type SoundEvent = z.infer<typeof SoundEventSchema>;

export const ClipSchema = z.object({
  uuid: z.string().uuid(),
  start_time: z.number(),
  end_time: z.number(),
  recording: RecordingSchema,
  features: z.array(FeatureSchema).optional(),
  created_on: z.coerce.date(),
});

export type Clip = z.infer<typeof ClipSchema>;

export const AnnotationTagSchema = z.object({
  tag: TagSchema,
  created_by: UserSchema.optional(),
  created_on: z.coerce.date(),
});

export type AnnotationTag = z.infer<typeof AnnotationTagSchema>;

export const SoundEventAnnotationSchema = z.object({
  uuid: z.string().uuid(),
  sound_event: SoundEventSchema,
  created_by: UserSchema.optional(),
  notes: z.array(NoteSchema).optional(),
  tags: z.array(AnnotationTagSchema).optional(),
  created_on: z.coerce.date(),
});

export type SoundEventAnnotation = z.infer<typeof SoundEventAnnotationSchema>;

export const ClipAnnotationSchema = z.object({
  uuid: z.string().uuid(),
  clip: ClipSchema,
  created_by: UserSchema.optional(),
  notes: z.array(NoteSchema).optional(),
  tags: z.array(AnnotationTagSchema).optional(),
  sound_events: z.array(SoundEventAnnotationSchema).optional(),
  created_on: z.coerce.date(),
});

export type ClipAnnotation = z.infer<typeof ClipAnnotationSchema>;

export const AnnotationStatusSchema = z.enum([
  "assigned",
  "verified",
  "rejected",
  "completed",
]);

export type AnnotationStatus = z.infer<typeof AnnotationStatusSchema>;

export const AnnotationStatusBadgeSchema = z.object({
  state: AnnotationStatusSchema,
  user: UserSchema.optional(),
  created_on: z.coerce.date(),
});

export type AnnotationStatusBadge = z.infer<typeof AnnotationStatusBadgeSchema>;

export const AnnotationTaskSchema = z.object({
  uuid: z.string().uuid(),
  clip: ClipSchema,
  status_badges: z.array(AnnotationStatusBadgeSchema).optional(),
  created_on: z.coerce.date(),
});

export type AnnotationTask = z.infer<typeof AnnotationTaskSchema>;

export const AnnotationProjectSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  annotation_instructions: z.string().optional(),
  tags: z.array(AnnotationTagSchema).optional(),
  created_on: z.coerce.date(),
});

export type AnnotationProject = z.infer<typeof AnnotationProjectSchema>;

export const PredictionTagSchema = z.object({
  tag: TagSchema,
  score: z.number(),
  created_on: z.coerce.date(),
});

export type PredictionTag = z.infer<typeof PredictionTagSchema>;

export const SoundEventPredictionSchema = z.object({
  uuid: z.string().uuid(),
  sound_event: SoundEventSchema,
  score: z.number(),
  predicted_tags: z.array(PredictionTagSchema).optional(),
  created_on: z.coerce.date(),
});

export type SoundEventPrediction = z.infer<typeof SoundEventPredictionSchema>;

export const ClipPredictionSchema = z.object({
  uuid: z.string().uuid(),
  clip: ClipSchema,
  predicted_tags: z.array(PredictionTagSchema).optional(),
  sound_events: z.array(SoundEventPredictionSchema).optional(),
  created_on: z.coerce.date(),
});

export type ClipPrediction = z.infer<typeof ClipPredictionSchema>;

export const ModelRunSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  version: z.string(),
  description: z.string().optional(),
  created_on: z.coerce.date(),
});

export type ModelRun = z.infer<typeof ModelRunSchema>;

export const UserRunSchema = z.object({
  uuid: z.string().uuid(),
  user: UserSchema,
  created_on: z.coerce.date(),
});

export type UserRun = z.infer<typeof UserRunSchema>;

export const SoundEventEvaluationSchema = z.object({
  uuid: z.string().uuid(),
  source: SoundEventPredictionSchema,
  target: SoundEventAnnotationSchema,
  affinity: z.number(),
  score: z.number(),
  metrics: z.array(FeatureSchema).optional(),
  created_on: z.coerce.date(),
});

export type SoundEventEvaluation = z.infer<typeof SoundEventEvaluationSchema>;

export const ClipEvaluationSchema = z.object({
  uuid: z.string().uuid(),
  clip_annotation: ClipAnnotationSchema,
  clip_prediction: ClipPredictionSchema,
  sound_event_evaluations: z.array(SoundEventEvaluationSchema).optional(),
  score: z.number(),
  metrics: z.array(FeatureSchema).optional(),
  created_on: z.coerce.date(),
});

export type ClipEvaluation = z.infer<typeof ClipEvaluationSchema>;

export const EvaluationSchema = z.object({
  uuid: z.string().uuid(),
  task: z.string(),
  score: z.number(),
  metrics: z.array(FeatureSchema).optional(),
  created_on: z.coerce.date(),
});

export type Evaluation = z.infer<typeof EvaluationSchema>;

export const EvaluationSetSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  tags: z.array(AnnotationTagSchema).optional(),
  created_on: z.coerce.date(),
});

export type EvaluationSet = z.infer<typeof EvaluationSetSchema>;
