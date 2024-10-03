import { type FillStyle } from "@/lib/draw/styles";
import { type MultiPoint, type Point } from "@/lib/types";

export interface PointStyle extends FillStyle {
  radius?: number;
}

const DEFAULT_RADIUS = 4;
const DEFAULT_FILL_ALPHA = 1;
const DEFAULT_FILL_COLOR = "red";

export const DEFAULT_POINT_STYLE: PointStyle = {
  fillColor: DEFAULT_FILL_COLOR,
  fillAlpha: DEFAULT_FILL_ALPHA,
  radius: DEFAULT_RADIUS,
};

export function drawPoint(
  ctx: CanvasRenderingContext2D,
  point: Point,
  style: PointStyle = DEFAULT_POINT_STYLE,
) {
  if ((style.fillAlpha ?? DEFAULT_FILL_ALPHA) !== 0) {
    const { coordinates } = point;
    const [x, y] = coordinates;

    ctx.fillStyle = style.fillColor ?? DEFAULT_FILL_COLOR;
    ctx.globalAlpha = style.fillAlpha ?? 1;

    ctx.beginPath();
    ctx.arc(x, y, style.radius ?? DEFAULT_RADIUS, 0, Math.PI * 2, true);
    ctx.fill();
  }
}

export function drawMultiPoint(
  ctx: CanvasRenderingContext2D,
  multipoint: MultiPoint,
  style: PointStyle = DEFAULT_POINT_STYLE,
) {
  const { coordinates } = multipoint;

  coordinates.forEach((coords) => {
    drawPoint(
      ctx,
      {
        type: "Point",
        coordinates: coords,
      },
      style,
    );
  });
}
