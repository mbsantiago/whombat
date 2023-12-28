import drawHandle from "@/draw/handle";
import { drawLineString } from "@/draw/linestring";
import { drawPolygon } from "@/draw/polygon";
import { PRIMARY, type Style } from "@/draw/styles";
import { type Geometry, type Position } from "@/utils/types";

const HANDLE_SIZE = 5;
const HANDLE_SIZE_HOVER = 10;
const HANDLE_COLOR = PRIMARY;
const HANDLE_COLOR_HOVER = PRIMARY;
const HANDLE_BORDER_SIZE = 1;
const HANDLE_BORDER_SIZE_HOVER = 3;
const EDGE_WIDTH_HOVER = 3;
const AREA_FILL_HOVER = 0.3;

export type Keypoint<T> = {
  type: "Keypoint";
  coords: Position;
  drag: (current: T, start: Position, end: Position) => T;
};

export type Edge<T> = {
  type: "Edge";
  coords: [Position, Position];
  drag: (current: T, start: Position, end: Position) => T;
};

export type Area<T> = {
  type: "Area";
  coords: Position[][];
  drag: (current: T, start: Position, end: Position) => T;
};

export type EditableElement<T> = Keypoint<T> | Edge<T> | Area<T>;

export function drawKeypoint<T>(
  ctx: CanvasRenderingContext2D,
  keypoint: Keypoint<T>,
  isHovering = false,
) {
  drawHandle(ctx, keypoint.coords, {
    size: isHovering ? HANDLE_SIZE_HOVER : HANDLE_SIZE,
    borderColor: isHovering ? HANDLE_COLOR_HOVER : HANDLE_COLOR,
    borderWidth: isHovering ? HANDLE_BORDER_SIZE_HOVER : HANDLE_BORDER_SIZE,
  });
}

export function drawEdge<T>(
  ctx: CanvasRenderingContext2D,
  edge: Edge<T>,
  { borderColor, borderWidth, borderAlpha, borderDash }: Style,
  isHovering = false,
) {
  const [start, end] = edge.coords;
  const middleHandle: Position = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2,
  ];
  drawLineString(
    ctx,
    {
      type: "LineString",
      coordinates: [start, end],
    },
    {
      borderColor: isHovering ? PRIMARY : borderColor,
      borderWidth: isHovering ? EDGE_WIDTH_HOVER : borderWidth,
      borderAlpha,
      borderDash,
    },
  );
  drawHandle(ctx, middleHandle, {
    size: isHovering ? HANDLE_SIZE_HOVER : HANDLE_SIZE,
    borderColor: isHovering ? HANDLE_COLOR_HOVER : HANDLE_COLOR,
    borderWidth: isHovering ? HANDLE_BORDER_SIZE_HOVER : HANDLE_BORDER_SIZE,
  });
}

export function drawArea<T>(
  ctx: CanvasRenderingContext2D,
  area: Area<T>,
  { fillAlpha, fillColor, borderColor }: Style,
  isHovering = false,
): void {
  drawPolygon(
    ctx,
    { type: "Polygon", coordinates: area.coords },
    {
      fillAlpha: isHovering ? AREA_FILL_HOVER : fillAlpha,
      fillColor: isHovering ? PRIMARY : fillColor ?? borderColor,
      borderWidth: 0,
      borderAlpha: 0,
    },
  );
}

export function drawEditableElement<T>(
  ctx: CanvasRenderingContext2D,
  element: EditableElement<T>,
  style: Style,
  isHovering: boolean,
) {
  const { type } = element;
  switch (type) {
    case "Keypoint":
      drawKeypoint(ctx, element, isHovering);
      break;
    case "Edge":
      drawEdge(ctx, element, style, isHovering);
      break;
    case "Area":
      drawArea(ctx, element, style, isHovering);
      break;
    default:
      break;
  }
}

export function convertElementToGeometry<T>(
  element: EditableElement<T>,
): Geometry {
  const { type } = element;

  switch (type) {
    case "Keypoint":
      return { type: "Point", coordinates: element.coords };
    case "Edge":
      return { type: "LineString", coordinates: element.coords };
    case "Area":
      return { type: "Polygon", coordinates: element.coords };
    default:
      throw Error();
  }
}
