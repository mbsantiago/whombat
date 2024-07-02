/** Common types used for drawing
 *
 */

export type RGB = `rgb(${number}, ${number}, ${number})`;
export type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
export type HEX = `#${string}`;
export type Color = RGB | RGBA | HEX | string;

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

export type Point = {
  type: "Point";
  coordinates: Position;
};

export type MultiPoint = {
  type: "MultiPoint";
  coordinates: Position[];
};

export type LineString = {
  type: "LineString";
  coordinates: Position[];
};

export type MultiLineString = {
  type: "MultiLineString";
  coordinates: Position[][];
};

export type Polygon = {
  type: "Polygon";
  coordinates: Position[][];
};

export type MultiPolygon = {
  type: "MultiPolygon";
  coordinates: Position[][][];
};

export type BasicGeometry =
  | Point
  | MultiPoint
  | LineString
  | MultiLineString
  | Polygon
  | MultiPolygon;

export type GeometryCollection = {
  type: "GeometryCollection";
  geometries: BasicGeometry[];
};

export type Geometry =
  | Point
  | MultiPoint
  | LineString
  | MultiLineString
  | Polygon
  | MultiPolygon
  | GeometryCollection;

export type Feature = {
  type: "Feature";
  geometry: Geometry | null;
  properties?: JSONObject | null;
};

export type FeatureCollection = {
  type: "FeatureCollection";
  features: Feature[];
};

export type GeoJSONGeometry = Geometry | Feature | FeatureCollection;
