import { BorderStyle, setBorderStyle } from "@/lib/draw/styles";
import { type LineString, type MultiLineString } from "@/lib/types";

const DEFAULT_BORDER_ALPHA = 1;
const DEFAULT_BORDER_WIDTH = 2;
const DEFAULT_BORDER_COLOR = "red";

export const DEFAULT_LINESTRING_STYLE: BorderStyle = {
  borderColor: DEFAULT_BORDER_COLOR,
  borderWidth: DEFAULT_BORDER_WIDTH,
  borderAlpha: DEFAULT_BORDER_ALPHA,
};

export function drawLineString(
  ctx: CanvasRenderingContext2D,
  linestring: LineString,
  style: BorderStyle = DEFAULT_LINESTRING_STYLE,
) {
  if ((style.borderAlpha ?? DEFAULT_BORDER_ALPHA) !== 0) {
    const { coordinates } = linestring;

    // Do nothing if bad linestring
    if (coordinates.length < 2) return;

    setBorderStyle(ctx, style);

    ctx.beginPath();

    // Begin path at first point
    const [x0, y0] = coordinates[0];
    ctx.moveTo(x0, y0);

    coordinates.slice(1).forEach(([x, y]) => {
      ctx.lineTo(x, y);
    });

    ctx.stroke();
  }
}

export function drawMultiLineString(
  ctx: CanvasRenderingContext2D,
  multilinestring: MultiLineString,
  style: BorderStyle = DEFAULT_LINESTRING_STYLE,
) {
  const { coordinates } = multilinestring;

  coordinates.forEach((coords) => {
    drawLineString(
      ctx,
      {
        type: "LineString",
        coordinates: coords,
      },
      style,
    );
  });
}
