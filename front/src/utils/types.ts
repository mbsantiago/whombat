export type Onset = number;

export type JSONValue = string | number | boolean | JSONObject | JSONArray;

export interface JSONObject {
  [x: string]: JSONValue;
}

export type JSONArray = Array<JSONValue>;

type Start = number;
type End = number;
export type Interval = [Start, End];

type Left = number;
type Right = number;
type Top = number;
type Bottom = number;
export type BBox = [Left, Top, Bottom, Right];

export type Dimensions = {
  width: number;
  height: number;
};

export type Position = [number, number];

export type TimeStamp = {
  type: "TimeStamp";
  coordinates: number;
};

export type TimeInterval = {
  type: "TimeInterval";
  coordinates: Interval;
};

export type BoundingBox = {
  type: "BoundingBox";
  coordinates: BBox;
};

export type Point = {
  type: "Point";
  coordinates: Position;
};

export type LineString = {
  type: "LineString";
  coordinates: Position[];
};

export type Polygon = {
  type: "Polygon";
  coordinates: Position[][];
};

export type MultiPoint = {
  type: "MultiPoint";
  coordinates: Position[];
};

export type MultiLineString = {
  type: "MultiLineString";
  coordinates: Position[][];
};

export type MultiPolygon = {
  type: "MultiPolygon";
  coordinates: Position[][][];
};

export type Geometry =
  | TimeStamp
  | TimeInterval
  | Point
  | LineString
  | Polygon
  | BoundingBox
  | MultiPoint
  | MultiLineString
  | MultiPolygon;
