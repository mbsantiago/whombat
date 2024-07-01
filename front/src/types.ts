import { z } from "zod";
import type {
  MoveStartEvent as MoveStartEventAria,
  MoveMoveEvent as MoveMoveEventAria,
  MoveEndEvent as MoveEndEventAria,
  PressEvent as PressEventAria,
} from "react-aria";

import {
  SpectrogramSettingsSchema,
  AudioSettingsSchema,
  AnnotationProjectSchema,
  AnnotationStatusBadgeSchema,
  AnnotationStatusSchema,
  AnnotationTagSchema,
  AnnotationTaskSchema,
  BoundingBoxSchema,
  ClipAnnotationSchema,
  ClipEvaluationSchema,
  ClipPredictionSchema,
  ClipSchema,
  DatasetSchema,
  DateFilterSchema,
  EvaluationSchema,
  EvaluationSetSchema,
  FeatureSchema,
  FileStateSchema,
  GeometrySchema,
  GeometryTypeSchema,
  IntegerFilterSchema,
  IntervalSchema,
  LineStringSchema,
  ModelRunSchema,
  MultiLineStringSchema,
  MultiPointSchema,
  MultiPolygonSchema,
  NoteSchema,
  NumberFilterSchema,
  PointSchema,
  PolygonSchema,
  PredictedTagFilterSchema,
  PredictionTagSchema,
  RecordingSchema,
  RecordingStateSchema,
  SoundEventAnnotationSchema,
  SoundEventEvaluationSchema,
  SoundEventPredictionSchema,
  SoundEventSchema,
  SpectrogramParametersSchema,
  SpectrogramWindowSchema,
  StringFilterSchema,
  TagSchema,
  TimeFilterSchema,
  TimeIntervalSchema,
  TimeStampSchema,
  UserRunSchema,
  UserSchema,
} from "@/schemas";

export type User = z.infer<typeof UserSchema>;

export type Tag = z.infer<typeof TagSchema>;

export type Feature = z.infer<typeof FeatureSchema>;

export type Note = z.infer<typeof NoteSchema>;

export type Recording = z.infer<typeof RecordingSchema>;

export type FileState = z.infer<typeof FileStateSchema>;

export type RecordingState = z.infer<typeof RecordingStateSchema>;

export type Dataset = z.infer<typeof DatasetSchema>;

export type GeometryType = z.infer<typeof GeometryTypeSchema>;

export type TimeStamp = z.infer<typeof TimeStampSchema>;

export type TimeInterval = z.infer<typeof TimeIntervalSchema>;

export type BoundingBox = z.infer<typeof BoundingBoxSchema>;

export type Point = z.infer<typeof PointSchema>;

export type LineString = z.infer<typeof LineStringSchema>;

export type Polygon = z.infer<typeof PolygonSchema>;

export type MultiPoint = z.infer<typeof MultiPointSchema>;

export type MultiLineString = z.infer<typeof MultiLineStringSchema>;

export type MultiPolygon = z.infer<typeof MultiPolygonSchema>;

export type Geometry = z.infer<typeof GeometrySchema>;

export type SoundEvent = z.infer<typeof SoundEventSchema>;

export type Clip = z.infer<typeof ClipSchema>;

export type AnnotationTag = z.infer<typeof AnnotationTagSchema>;

export type SoundEventAnnotation = z.infer<typeof SoundEventAnnotationSchema>;

export type ClipAnnotation = z.infer<typeof ClipAnnotationSchema>;

export type AnnotationStatus = z.infer<typeof AnnotationStatusSchema>;

export type AnnotationStatusBadge = z.infer<typeof AnnotationStatusBadgeSchema>;

export type AnnotationTask = z.infer<typeof AnnotationTaskSchema>;

export type AnnotationProject = z.infer<typeof AnnotationProjectSchema>;

export type PredictionTag = z.infer<typeof PredictionTagSchema>;

export type SoundEventPrediction = z.infer<typeof SoundEventPredictionSchema>;

export type ClipPrediction = z.infer<typeof ClipPredictionSchema>;

export type ModelRun = z.infer<typeof ModelRunSchema>;

export type UserRun = z.infer<typeof UserRunSchema>;

export type SoundEventEvaluation = z.infer<typeof SoundEventEvaluationSchema>;

export type ClipEvaluation = z.infer<typeof ClipEvaluationSchema>;

export type Evaluation = z.infer<typeof EvaluationSchema>;

export type EvaluationSet = z.infer<typeof EvaluationSetSchema>;

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

export type Interval = z.infer<typeof IntervalSchema>;

export type SpectrogramWindow = z.infer<typeof SpectrogramWindowSchema>;

export type SpectrogramParameters = z.infer<typeof SpectrogramParametersSchema>;

export type AudioSettings = z.infer<typeof AudioSettingsSchema>;

export type SpectrogramSettings = z.infer<typeof SpectrogramSettingsSchema>;

export type JSONValue = string | number | boolean | JSONObject | JSONArray;

export interface JSONObject {
  [x: string]: JSONValue;
}

export type JSONArray = Array<JSONValue>;

export type DateFilter = z.input<typeof DateFilterSchema>;

export type TimeFilter = z.input<typeof TimeFilterSchema>;

export type NumberFilter = z.input<typeof NumberFilterSchema>;

export type StringFilter = z.input<typeof StringFilterSchema>;

export type PredictedTagFilter = z.input<typeof PredictedTagFilterSchema>;

export type IntegerFilter = z.input<typeof IntegerFilterSchema>;

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
