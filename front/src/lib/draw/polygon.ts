import type { BorderStyle, FillStyle } from "@/lib/draw/styles";
import type { Coordinates, MultiPolygon, Polygon } from "@/lib/types";

export type PolygonStyle = BorderStyle & FillStyle;

const DEFAULT_BORDER_ALPHA = 1;
const DEFAULT_BORDER_WIDTH = 1;
const DEFAULT_BORDER_COLOR = "red";
const DEFAULT_FILL_ALPHA = 0.5;
const DEFAULT_FILL_COLOR = "red";

export const DEFAULT_POLYGON_STYLE: PolygonStyle = {
  borderColor: DEFAULT_BORDER_COLOR,
  borderWidth: DEFAULT_BORDER_WIDTH,
  borderAlpha: DEFAULT_BORDER_ALPHA,
  fillAlpha: DEFAULT_FILL_ALPHA,
  fillColor: DEFAULT_FILL_COLOR,
};

function traceLinering(ctx: CanvasRenderingContext2D, linering: Coordinates[]) {
  if (linering.length < 2) {
    // eslint-disable-next-line no-console
    console.error("Invalid linering. Needs at least two points");
    return;
  }
  const [x1, y1] = linering[0];
  ctx.moveTo(x1, y1);
  linering.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
  ctx.lineTo(x1, y1);
}

export function drawPolygon(
  ctx: CanvasRenderingContext2D,
  polygon: Polygon,
  style: PolygonStyle = DEFAULT_POLYGON_STYLE,
) {
  const { coordinates } = polygon;
  if (coordinates.length === 0) {
    // eslint-disable-next-line no-console
    console.error("Polygon has no exterior ring");
    return;
  }

  const exterior = coordinates[0];
  if (exterior.length < 2) {
    // eslint-disable-next-line no-console
    console.error("Invalid exterior ring for polygon");
    return;
  }

  // Trace path
  const [x0, y0] = exterior[0];
  ctx.beginPath();
  traceLinering(ctx, exterior);
  coordinates.slice(1).forEach((interior) => {
    if (interior.length < 2) {
      // eslint-disable-next-line no-console
      console.error("Invalid interior ring for polygon");
      return;
    }
    traceLinering(ctx, interior);
    ctx.moveTo(x0, y0);
  });
  ctx.closePath();

  // Draw filling
  ctx.fillStyle = style.fillColor ?? style.borderColor ?? DEFAULT_FILL_COLOR;
  ctx.globalAlpha = style.fillAlpha ?? 1;
  ctx.fill("evenodd");

  // Draw border
  ctx.strokeStyle = style.borderColor ?? DEFAULT_BORDER_COLOR;
  ctx.lineWidth = style.borderWidth ?? DEFAULT_BORDER_WIDTH;
  ctx.globalAlpha = style.borderAlpha ?? DEFAULT_BORDER_ALPHA;
  if (style.borderDash) {
    ctx.setLineDash(style.borderDash);
  }
  ctx.stroke();
}

export function drawMultiPolygon(
  ctx: CanvasRenderingContext2D,
  multipolygon: MultiPolygon,
  style: PolygonStyle = DEFAULT_POLYGON_STYLE,
) {
  const { coordinates } = multipolygon;

  coordinates.forEach((coords) => {
    drawPolygon(
      ctx,
      {
        type: "Polygon",
        coordinates: coords,
      },
      style,
    );
  });
}
