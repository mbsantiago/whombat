import type { Color, JSONObject } from "@/draw/common";

export const GREEN = "rgb(16 185 129)"; // emerald-500
export const BLUE = "rgb(59,130,246)"; // blue-500
export const RED = "rgb(239 68 68)"; // red-500
export const ORANGE = "rgb(245 158 11)"; // amber-500

export interface BorderStyle {
  borderColor?: Color;
  borderAlpha?: number;
  borderWidth?: number;
  borderDash?: number[];
}

export interface FillStyle {
  fillAlpha?: number;
  fillColor?: Color;
}

export type FontWeight = "normal" | "bold" | "lighter" | "bolder" | number;

export interface FontStyle {
  fontFamily?: string;
  fontSize?: number;
  fontStyle?: "normal" | "italic" | "oblique";
  fontWeight?: FontWeight;
  fontColor?: Color;
  fontAlpha?: number;
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
}

export type TickStyle = {
  color: Color;
  width: number;
  length: number;
  alpha: number;
};

export type AxisStyle = {
  color: Color;
};

export const DEFAULT_AXIS_STYLE = {
  color: "white",
};

export const MINOR_TICK_STYLE = {
  width: 1,
  length: 6,
};

export const MINOR_TICK_STYLE_GRID = {
  width: 1,
  length: -1,
  alpha: 0.6
}

export const MAYOR_TICK_STYLE = {
  width: 3,
  length: 20,
};

export const MAYOR_TICK_STYLE_GRID = {
  width: 1,
  length: -1,
  alpha: 0.7
}

export type Style = BorderStyle & FillStyle;

export type Styler<T> = (obj: T) => Style;

export type StyleModifier = (style: Style, properties: JSONObject) => Style;

export const DEFAULT_FONT_STYLE = "normal";
export const DEFAULT_FONT_WEIGHT = "normal";
export const DEFAULT_FONT_FAMILY = "system-ui";
export const DEFAULT_FONT_SIZE = 12;
export const DEFAULT_FONT_COLOR = "#000000";
export const DEFAULT_FONT_ALPHA = 1;
export const DEFAULT_TEXT_ALIGN = "start";
export const DEFAULT_TEXT_BASELINE = "top";

export function setFontStyle(
  ctx: CanvasRenderingContext2D,
  {
    fontFamily = DEFAULT_FONT_FAMILY,
    fontStyle = DEFAULT_FONT_STYLE,
    fontWeight = DEFAULT_FONT_WEIGHT,
    fontColor = DEFAULT_FONT_COLOR,
    fontSize = DEFAULT_FONT_SIZE,
    fontAlpha = DEFAULT_FONT_ALPHA,
    textAlign = DEFAULT_TEXT_ALIGN,
    textBaseline = DEFAULT_TEXT_BASELINE,
  }: FontStyle,
) {
  ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.textAlign = textAlign;
  ctx.fillStyle = fontColor;
  ctx.textBaseline = textBaseline;
  ctx.globalAlpha = fontAlpha;
}

export const DEFAULT_FILL_ALPHA = 0.5;
export const DEFAULT_FILL_COLOR = "#ff0000";

export function setFillStyle(
  ctx: CanvasRenderingContext2D,
  { fillAlpha = DEFAULT_FILL_ALPHA, fillColor = DEFAULT_FILL_COLOR }: FillStyle,
) {
  ctx.fillStyle = fillColor;
  ctx.globalAlpha = fillAlpha;
}

export const DEFAULT_BORDER_ALPHA = 1;
export const DEFAULT_BORDER_COLOR = "#ff0000";
export const DEFAULT_BORDER_WIDTH = 1;

export function setBorderStyle(
  ctx: CanvasRenderingContext2D,
  {
    borderAlpha = DEFAULT_BORDER_ALPHA,
    borderColor = DEFAULT_BORDER_COLOR,
    borderWidth = DEFAULT_BORDER_WIDTH,
    borderDash,
  }: BorderStyle,
) {
  ctx.strokeStyle = borderColor ?? DEFAULT_BORDER_COLOR;
  ctx.lineWidth = borderWidth ?? DEFAULT_BORDER_WIDTH;
  ctx.globalAlpha = borderAlpha ?? DEFAULT_BORDER_ALPHA;
  if (borderDash != null) {
    ctx.setLineDash(borderDash);
  } else {
    ctx.setLineDash([]);
  }
}
