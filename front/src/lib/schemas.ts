import { z } from "zod";

import {
  DEFAULT_CMAP,
  DEFAULT_FILTER_ORDER,
  DEFAULT_OVERLAP,
  DEFAULT_SCALE,
  DEFAULT_WINDOW,
  DEFAULT_WINDOW_SIZE,
  MAX_SAMPLERATE,
  MIN_DB,
  MIN_SAMPLERATE,
} from "@/lib/constants";

export const UserSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  email: z.string().email().optional(),
  name: z.string().nullable().optional(),
});

export const TagSchema = z.object({
  key: z.string(),
  value: z.string(),
});

export const FeatureSchema = z.object({
  name: z.string(),
  value: z.number(),
});

export const NoteSchema = z.object({
  uuid: z.string().uuid(),
  message: z.string(),
  is_issue: z.boolean(),
  created_by: UserSchema.nullish(),
  created_on: z.coerce.date(),
});

export const TimeStringSchema = z.string().regex(/^\d{2}:\d{2}:\d{2}(\.\d+)?$/);

export const RecordingSchema = z.object({
  uuid: z.string().uuid(),
  path: z.string(),
  hash: z.string(),
  duration: z.number(),
  channels: z.number().int(),
  samplerate: z.number().int(),
  time_expansion: z.number().default(1),
  date: z.coerce.date().nullish(),
  time: TimeStringSchema.nullish(),
  latitude: z.number().nullish(),
  longitude: z.number().nullish(),
  rights: z.string().nullish(),
  tags: z.array(TagSchema).optional(),
  features: z.array(FeatureSchema).optional(),
  notes: z.array(NoteSchema).optional(),
  owners: z.array(UserSchema).optional(),
  created_on: z.coerce.date(),
});

export const FileStateSchema = z.enum([
  "missing",
  "registered",
  "unregistered",
]);

export const RecordingStateSchema = z.object({
  path: z.string(),
  state: FileStateSchema,
});

export const DatasetSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  audio_dir: z.string(),
  description: z.string(),
  recording_count: z.number().int().default(0),
  created_on: z.coerce.date(),
});

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

export const TimeStampSchema = z.object({
  type: z.literal("TimeStamp"),
  coordinates: z.number(),
});

export const TimeIntervalSchema = z.object({
  type: z.literal("TimeInterval"),
  coordinates: z.array(z.number()),
});

export const BoundingBoxSchema = z.object({
  type: z.literal("BoundingBox"),
  coordinates: z.array(z.number()),
});

export const PointSchema = z.object({
  type: z.literal("Point"),
  coordinates: z.array(z.number()),
});

export const LineStringSchema = z.object({
  type: z.literal("LineString"),
  coordinates: z.array(z.array(z.number())),
});

export const PolygonSchema = z.object({
  type: z.literal("Polygon"),
  coordinates: z.array(z.array(z.array(z.number()))),
});

export const MultiPointSchema = z.object({
  type: z.literal("MultiPoint"),
  coordinates: z.array(z.array(z.number())),
});

export const MultiLineStringSchema = z.object({
  type: z.literal("MultiLineString"),
  coordinates: z.array(z.array(z.array(z.number()))),
});

export const MultiPolygonSchema = z.object({
  type: z.literal("MultiPolygon"),
  coordinates: z.array(z.array(z.array(z.array(z.number())))),
});

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

export const SoundEventSchema = z.object({
  uuid: z.string().uuid(),
  geometry: GeometrySchema,
  geometry_type: GeometryTypeSchema,
  features: z.array(FeatureSchema).nullish(),
  created_on: z.coerce.date(),
});

export const ClipSchema = z.object({
  uuid: z.string().uuid(),
  start_time: z.number(),
  end_time: z.number(),
  recording: RecordingSchema,
  features: z.array(FeatureSchema).nullish(),
  created_on: z.coerce.date(),
});

export const AnnotationTagSchema = z.object({
  tag: TagSchema,
  created_by: UserSchema.nullish(),
  created_on: z.coerce.date(),
});

export const SoundEventAnnotationSchema = z.object({
  uuid: z.string().uuid(),
  sound_event: SoundEventSchema,
  created_by: UserSchema.nullish(),
  notes: z.array(NoteSchema).nullish(),
  tags: z.array(TagSchema).nullish(),
  created_on: z.coerce.date(),
});

export const ClipAnnotationSchema = z.object({
  uuid: z.string().uuid(),
  clip: ClipSchema,
  created_by: UserSchema.nullish(),
  notes: z.array(NoteSchema).nullish(),
  tags: z.array(TagSchema).nullish(),
  sound_events: z.array(SoundEventAnnotationSchema).nullish(),
  created_on: z.coerce.date(),
});

export const AnnotationStatusSchema = z.enum([
  "assigned",
  "verified",
  "rejected",
  "completed",
]);

export const AnnotationStatusBadgeSchema = z.object({
  state: AnnotationStatusSchema,
  user: UserSchema.nullish(),
  created_on: z.coerce.date(),
});

export const AnnotationTaskSchema = z.object({
  uuid: z.string().uuid(),
  status_badges: z.array(AnnotationStatusBadgeSchema).nullish(),
  created_on: z.coerce.date(),
  clip: ClipSchema.nullish(),
  clip_annotation: ClipAnnotationSchema.nullish(),
});

export const AnnotationProjectSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  annotation_instructions: z.string().nullish(),
  tags: z.array(TagSchema).nullish(),
  created_on: z.coerce.date(),
});

export const PredictionTagSchema = z.object({
  tag: TagSchema,
  score: z.number(),
  created_on: z.coerce.date(),
});

export const SoundEventPredictionSchema = z.object({
  uuid: z.string().uuid(),
  sound_event: SoundEventSchema,
  score: z.number(),
  tags: z.array(PredictionTagSchema).nullish(),
  created_on: z.coerce.date(),
});

export const ClipPredictionSchema = z.object({
  uuid: z.string().uuid(),
  clip: ClipSchema,
  tags: z.array(PredictionTagSchema).nullish(),
  sound_events: z.array(SoundEventPredictionSchema).nullish(),
  created_on: z.coerce.date(),
});

export const ModelRunSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  version: z.string(),
  description: z.string().nullish(),
  created_on: z.coerce.date(),
});

export const UserRunSchema = z.object({
  uuid: z.string().uuid(),
  user: UserSchema,
  created_on: z.coerce.date(),
});

export const SoundEventEvaluationSchema = z.object({
  uuid: z.string().uuid(),
  source: SoundEventPredictionSchema.nullish(),
  target: SoundEventAnnotationSchema.nullish(),
  affinity: z.number(),
  score: z.number(),
  metrics: z.array(FeatureSchema).nullish(),
  created_on: z.coerce.date(),
});

export const ClipEvaluationSchema = z.object({
  uuid: z.string().uuid(),
  clip_annotation: ClipAnnotationSchema,
  clip_prediction: ClipPredictionSchema,
  sound_event_evaluations: z.array(SoundEventEvaluationSchema).nullish(),
  score: z.number(),
  metrics: z.array(FeatureSchema).nullish(),
  created_on: z.coerce.date(),
});

export const EvaluationSchema = z.object({
  uuid: z.string().uuid(),
  task: z.string(),
  score: z.number(),
  metrics: z.array(FeatureSchema).nullish(),
  created_on: z.coerce.date(),
});

export const PREDICTION_TYPES = [
  "Clip Classification",
  "Clip Tagging",
  "Sound Event Detection",
  "Sound Event Tagging",
] as const;

export const EvaluationSetSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  description: z.string().nullish(),
  task: z.enum(PREDICTION_TYPES),
  tags: z.array(TagSchema).nullish(),
  created_on: z.coerce.date(),
});

export const IntervalSchema = z.object({
  min: z.number(),
  max: z.number(),
});

export const SpectrogramWindowSchema = z.object({
  time: IntervalSchema,
  freq: IntervalSchema,
});

export const AudioSettingsSchema = z
  .object({
    resample: z.boolean().default(false),
    samplerate: z.coerce
      .number()
      .positive()
      .int()
      .gte(MIN_SAMPLERATE)
      .lte(MAX_SAMPLERATE)
      .nullish(),
    channel: z.coerce.number().nonnegative().int().default(0),
    low_freq: z.coerce.number().nonnegative().nullish(),
    high_freq: z.coerce.number().nonnegative().nullish(),
    filter_order: z.coerce
      .number()
      .positive()
      .int()
      .default(DEFAULT_FILTER_ORDER),
    speed: z.coerce.number().positive().default(1),
  })
  .refine(
    // check that low_freq and high_freq are in the correct order
    (data) => {
      if (data.low_freq == null || data.high_freq == null) return true;
      return data.low_freq < data.high_freq;
    },
    {
      message: "low_freq must be less than high_freq",
      path: ["low_freq"],
    },
  )
  .refine(
    // check that if samplerate is defined that low_freq is less
    // than nyquist frequency
    (data) => {
      if (data.samplerate == null || data.low_freq == null || !data.resample)
        return true;
      return data.low_freq <= data.samplerate / 2;
    },
    {
      message: "low_freq must be less than half the samplerate",
      path: ["low_freq"],
    },
  )
  .refine(
    // check that if samplerate is defined that high_freq is less
    // than nyquist frequency
    (data) => {
      if (data.samplerate == null || data.high_freq == null || !data.resample)
        return true;
      return data.high_freq <= data.samplerate / 2;
    },
    {
      message: "high_freq must be less than half the samplerate",
      path: ["high_freq"],
    },
  );

export const SCALES = ["amplitude", "power", "dB"] as const;
export const WINDOWS = [
  "boxcar",
  "triang",
  "bartlett",
  "flattop",
  "parzen",
  "bohman",
  "blackman",
  "blackmanharris",
  "nuttall",
  "barthann",
  "hamming",
  "hann",
  "kaiser",
] as const;
export const COLORMAPS = [
  "gray",
  "viridis",
  "magma",
  "inferno",
  "plasma",
  "cividis",
  "cool",
  "cubehelix",
  "twilight",
] as const;

export const SpectrogramSettingsSchema = z.object({
  window_size: z.coerce.number().positive().default(DEFAULT_WINDOW_SIZE),
  overlap: z.coerce.number().positive().gt(0).lte(1).default(DEFAULT_OVERLAP),
  window: z.enum(WINDOWS).default(DEFAULT_WINDOW),
  scale: z.enum(SCALES).default(DEFAULT_SCALE),
  clamp: z.boolean().default(true),
  min_dB: z.coerce.number().nonpositive().gte(MIN_DB).default(-80),
  max_dB: z.coerce.number().nonpositive().gte(MIN_DB).default(0),
  normalize: z.boolean().default(false),
  pcen: z.boolean().default(false),
  cmap: z.enum(COLORMAPS).default(DEFAULT_CMAP),
});

export const SpectrogramParametersSchema = z
  .object({
    resample: z.boolean().default(false),
    samplerate: z.coerce
      .number()
      .positive()
      .int()
      .gte(MIN_SAMPLERATE)
      .lte(MAX_SAMPLERATE)
      .nullish(),
    low_freq: z.coerce.number().positive().nullish(),
    high_freq: z.coerce.number().positive().nullish(),
    filter_order: z.coerce
      .number()
      .positive()
      .int()
      .default(DEFAULT_FILTER_ORDER),
    window_size: z.coerce.number().positive().default(DEFAULT_WINDOW_SIZE),
    overlap: z.coerce.number().positive().gt(0).lte(1).default(DEFAULT_OVERLAP),
    window: z.string().default(DEFAULT_WINDOW),
    scale: z.enum(["amplitude", "power", "dB"]).default(DEFAULT_SCALE),
    clamp: z.boolean().default(true),
    min_dB: z.coerce.number().nonpositive().gte(MIN_DB).default(-80),
    max_dB: z.coerce.number().nonpositive().gte(MIN_DB).default(0),
    normalize: z.boolean().default(false),
    channel: z.coerce.number().nonnegative().int().default(0),
    pcen: z.boolean().default(false),
    cmap: z.string().default(DEFAULT_CMAP),
  })
  .refine(
    (data) => {
      if (data.low_freq == null || data.high_freq == null) return true;
      return data.low_freq <= data.high_freq;
    },
    {
      message: "low_freq must be less than high_freq",
      path: ["low_freq"],
    },
  )
  .refine(
    (data) => {
      return data.min_dB < data.max_dB;
    },
    {
      message: "min_dB must be less than max_dB",
      path: ["min_dB"],
    },
  );

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

export const PredictedTagFilterSchema = z.object({
  tag: TagSchema,
  gt: z.number().optional(),
  lt: z.number().optional(),
});

export const StringFilterSchema = z.object({
  eq: z.string().optional(),
  has: z.string().optional(),
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
