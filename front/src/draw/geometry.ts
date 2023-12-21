import type { Geometry } from "@/api/schemas";
import type { BorderStyle, FillStyle } from "@/draw/styles";
import { drawLineString, drawMultiLineString } from "@/draw/linestring";
import { drawPoint, drawMultiPoint } from "@/draw/point";
import { drawPolygon, drawMultiPolygon } from "@/draw/polygon";
import drawOnset from "@/draw/onset";
import drawInterval from "@/draw/interval";
import drawBBox from "@/draw/bbox";

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
