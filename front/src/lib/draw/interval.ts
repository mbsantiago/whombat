import { Style, setBorderStyle, setFillStyle } from "@/lib/draw/styles";
import type { Interval } from "@/lib/types";

const DEFAULT_FILL_COLOR = "red";
const DEFAULT_BORDER_ALPHA = 1;
const DEFAULT_FILL_ALPHA = 0.5;
const DEFAULT_BORDER_WIDTH = 1;

export const DEFAULT_INTERVAL_STYLE: Style = {
  fillColor: DEFAULT_FILL_COLOR,
  fillAlpha: DEFAULT_FILL_ALPHA,
  borderWidth: DEFAULT_BORDER_WIDTH,
  borderAlpha: DEFAULT_BORDER_ALPHA,
};

export default function drawInterval(
  ctx: CanvasRenderingContext2D,
  interval: Interval,
  style: Style = DEFAULT_INTERVAL_STYLE,
) {
  const { canvas } = ctx;
  const { height } = canvas;
  const { min: left, max: right } = interval;

  if ((style.borderAlpha ?? DEFAULT_BORDER_ALPHA) !== 0) {
    setBorderStyle(ctx, style);

    ctx.beginPath();
    ctx.moveTo(left, 0);
    ctx.lineTo(left, height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(right, 0);
    ctx.lineTo(right, height);
    ctx.stroke();
  }

  if ((style.fillAlpha ?? DEFAULT_FILL_ALPHA) !== 0) {
    setFillStyle(ctx, style);
    ctx.fillRect(left, 0, right - left, height);
  }
}
