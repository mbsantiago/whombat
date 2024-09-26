import {
  BorderStyle,
  FillStyle,
  setBorderStyle,
  setFillStyle,
} from "@/lib/draw/styles";
import type { Box } from "@/lib/types";

export type BBoxStyle = BorderStyle & FillStyle;

const DEFAULT_BORDER_ALPHA = 1;
const DEFAULT_BORDER_WIDTH = 1;
const DEFAULT_BORDER_COLOR = "red";
const DEFAULT_FILL_ALPHA = 0;
const DEFAULT_FILL_COLOR = "red";

export const DEFAULT_BBOX_STYLE: BBoxStyle = {
  borderColor: DEFAULT_BORDER_COLOR,
  borderWidth: DEFAULT_BORDER_WIDTH,
  borderAlpha: DEFAULT_BORDER_ALPHA,
  fillAlpha: DEFAULT_FILL_ALPHA,
  fillColor: DEFAULT_FILL_COLOR,
};

export default function drawBBox(
  ctx: CanvasRenderingContext2D,
  bbox: Box,
  style: BBoxStyle = DEFAULT_BBOX_STYLE,
) {
  const [left, top, right, bottom] = bbox;

  if ((style.borderAlpha ?? DEFAULT_BORDER_ALPHA) !== 0) {
    setBorderStyle(ctx, style);
    ctx.strokeRect(left, top, right - left, bottom - top);
  }

  if ((style.fillAlpha ?? DEFAULT_FILL_ALPHA) !== 0) {
    setFillStyle(ctx, style);
    ctx.fillRect(left, top, right - left, bottom - top);
  }
}
