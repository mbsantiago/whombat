import drawBBox from "@/lib/draw/bbox";
import drawInterval from "@/lib/draw/interval";
import { drawLineString, drawMultiLineString } from "@/lib/draw/linestring";
import drawOnset from "@/lib/draw/onset";
import { drawMultiPoint, drawPoint } from "@/lib/draw/point";
import { drawMultiPolygon, drawPolygon } from "@/lib/draw/polygon";
import type { BorderStyle, FillStyle } from "@/lib/draw/styles";
import type { Geometry } from "@/lib/types";

export type Style = BorderStyle & FillStyle;

export default function drawGeometry(
  ctx: CanvasRenderingContext2D,
  geometry: Geometry,
  style: Style,
) {
  const { type } = geometry;

  switch (type) {
    case "TimeStamp":
      drawOnset(ctx, geometry.coordinates, style);
      break;
    case "TimeInterval":
      const [min, max] = geometry.coordinates;
      drawInterval(ctx, { min, max }, style);
      break;
    case "BoundingBox":
      // @ts-ignore
      drawBBox(ctx, geometry.coordinates, style);
      break;
    case "Point":
      drawPoint(ctx, geometry, style);
      break;
    case "MultiPoint":
      drawMultiPoint(ctx, geometry, style);
      break;
    case "LineString":
      drawLineString(ctx, geometry, style);
      break;
    case "MultiLineString":
      drawMultiLineString(ctx, geometry, style);
      break;
    case "Polygon":
      drawPolygon(ctx, geometry, style);
      break;
    case "MultiPolygon":
      drawMultiPolygon(ctx, geometry, style);
      break;
    default:
      // eslint-disable-next-line no-console
      console.error(`Cannot draw unknown geometry type ${type}`);
      break;
  }
}
