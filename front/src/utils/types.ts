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
