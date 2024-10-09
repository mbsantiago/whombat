export type JSONValue = string | number | boolean | JSONObject | JSONArray;

export interface JSONObject {
  [x: string]: JSONValue;
}

export type JSONArray = Array<JSONValue>;

export type Shortcut = {
  label: string;
  shortcut: string;
  description: string;
};

export type Color = {
  color: string;
  level: number;
};
