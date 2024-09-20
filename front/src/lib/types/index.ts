import { z } from "zod";

import type {
  MoveStartEvent as MoveStartEventAria,
  MoveMoveEvent as MoveMoveEventAria,
  MoveEndEvent as MoveEndEventAria,
  PressEvent as PressEventAria,
} from "react-aria";

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

export type Recording = z.infer<typeof schemas.RecordingSchema>;

export type RecordingTag = z.infer<typeof schemas.RecordingTagSchema>;

export type RecordingTagFilter = z.infer<
  typeof schemas.RecordingTagFilterSchema
>;

export type RecordingNote = z.infer<typeof schemas.RecordingNoteSchema>;

export type FileState = z.infer<typeof schemas.FileStateSchema>;

export type RecordingState = z.infer<typeof schemas.RecordingStateSchema>;

export type Dataset = z.infer<typeof schemas.DatasetSchema>;

export type GeometryType = z.infer<typeof schemas.GeometryTypeSchema>;

export type TimeStamp = z.infer<typeof schemas.TimeStampSchema>;

export type TimeInterval = z.infer<typeof schemas.TimeIntervalSchema>;

export type BoundingBox = z.infer<typeof schemas.BoundingBoxSchema>;

export type Point = z.infer<typeof schemas.PointSchema>;

export type LineString = z.infer<typeof schemas.LineStringSchema>;

export type Polygon = z.infer<typeof schemas.PolygonSchema>;

export type MultiPoint = z.infer<typeof schemas.MultiPointSchema>;

export type MultiLineString = z.infer<typeof schemas.MultiLineStringSchema>;

export type MultiPolygon = z.infer<typeof schemas.MultiPolygonSchema>;

export type Geometry = z.infer<typeof schemas.GeometrySchema>;

export type SoundEvent = z.infer<typeof schemas.SoundEventSchema>;

export type Clip = z.infer<typeof schemas.ClipSchema>;

export type AnnotationTag = z.infer<typeof schemas.TagAssociationSchema>;

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

export type SoundEventAnnotationFilter = z.infer<
  typeof schemas.SoundEventAnnotationFilterSchema
>;

export type SoundEventAnnotationTagFilter = z.infer<
  typeof schemas.SoundEventAnnotationTagFilterSchema
>;

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

export type AnnotationStatus = z.infer<typeof schemas.AnnotationStatusSchema>;

export type AnnotationStatusBadge = z.infer<
  typeof schemas.AnnotationStatusBadgeSchema
>;

export type AnnotationTask = z.infer<typeof schemas.AnnotationTaskSchema>;

export type AnnotationProject = z.infer<typeof schemas.AnnotationProjectSchema>;

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

export type Position = {
  time: number;
  freq: number;
};

export type Pixel = {
  x: number;
  y: number;
};

export type Coordinates = number[];

export type Box = [number, number, number, number];

export type Dimensions = {
  width: number;
  height: number;
};

export type Interval = z.infer<typeof schemas.IntervalSchema>;

/** A chunk of the spectrogram. */
export type Chunk = {
  /** The interval of the chunk in seconds. */
  interval: Interval;
  /** A buffered interval for the chunk. */
  buffer: Interval;
};

export type SpectrogramWindow = z.infer<typeof schemas.SpectrogramWindowSchema>;

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

// Canvas types

export type CanvasContext = CanvasRenderingContext2D;
export type DrawFn = (ctx: CanvasContext, viewport: SpectrogramWindow) => void;

// Canvas interaction events

export type ScrollEvent = {
  position: Position;
  timeFrac: number;
  freqFrac: number;
  type: "wheel";
  deltaX: number;
  deltaY: number;
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  preventDefault: () => void;
  stopPropagation: () => void;
};

export type HoverEvent = {
  position: Position;
};

export type MoveStartEvent = {
  position: Position;
} & MoveStartEventAria;

export type MoveEndEvent = {
  position: Position;
} & MoveEndEventAria;

export type MoveEvent = {
  position: Position;
  initial: Position;
  shift: Position;
} & MoveMoveEventAria;

export type PressEvent = {
  position: Position;
} & PressEventAria;

export type DoublePressEvent = {
  position: Position;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  type: "dblpress";
  stopPropagation: () => void;
  preventDefault: () => void;
};

export type HoverHandler = (event: HoverEvent) => void;

export type MoveStartHandler = (event: MoveStartEvent) => void;

export type MoveEndHandler = (event: MoveEndEvent) => void;

export type MoveHandler = (event: MoveEvent) => void;

export type PressHandler = (event: PressEvent) => void;

export type ScrollHandler = (event: ScrollEvent) => void;

export type DoublePressHandler = (event: DoublePressEvent) => void;

export type CanvasHandlers = {
  onHover?: HoverHandler;
  onMoveStart?: MoveStartHandler;
  onMoveEnd?: MoveEndHandler;
  onMove?: MoveHandler;
  onPress?: PressHandler;
  onScroll?: ScrollHandler;
  onDoubleClick?: DoublePressHandler;
};

export type SpectrogramMode = "panning" | "zooming" | "idle";
