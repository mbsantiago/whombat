// @ts-ignore
import bbox from "@turf/bbox";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
// @ts-ignore

import type {
  BoundingBox,
  Geometry,
  LineString,
  MultiLineString,
  MultiPoint,
  MultiPolygon,
  Point,
  Polygon,
  TimeInterval,
  TimeStamp,
} from "@/api/schemas";
import { type SpectrogramWindow } from "@/api/spectrograms";
import type { BBox, Interval, Onset } from "@/utils/types";

const MAX_FREQ = 5_000_000;

type Position = number[];
type Dims = { width: number; height: number };

export function bboxIntersection(bbox1: BBox, bbox2: BBox): BBox | null {
  const [left1, top1, right1, bottom1] = bbox1;
  const [left2, top2, right2, bottom2] = bbox2;
  const left = Math.max(left1, left2);
  const top = Math.max(top1, top2);
  const right = Math.min(right1, right2);
  const bottom = Math.min(bottom1, bottom2);
  if (left > right || top > bottom) return null;
  return [left, top, right, bottom];
}

export function scaleTimeToViewport(
  value: number,
  window: SpectrogramWindow,
  width: number,
): number {
  const { time } = window;
  if (time.max === time.min) return time.max;
  return (width * (value - time.min)) / (time.max - time.min);
}

/** Transform x coordinates to time */
export function scaleXToWindow(
  value: number,
  window: SpectrogramWindow,
  width: number,
  relative: boolean = false,
): number {
  const { time } = window;
  const duration = time.max - time.min;
  if (relative) {
    return (duration * value) / width;
  }
  return time.min + (duration * value) / width;
}

/** Transform y coordinates to frequency */
export function scaleFreqToViewport(
  value: number,
  window: SpectrogramWindow,
  height: number,
): number {
  const { freq } = window;
  if (freq.max === freq.min) return freq.max;
  return (height * (freq.max - value)) / (freq.max - freq.min);
}

export function scaleYToWindow(
  value: number,
  window: SpectrogramWindow,
  height: number,
  relative: boolean = false,
): number {
  const { freq } = window;
  const bandwidth = freq.max - freq.min;
  if (relative) {
    return (bandwidth * value) / height;
  }
  return freq.max - (bandwidth * value) / height;
}

export function scalePixelsToWindow(
  position: { x: number; y: number },
  window: SpectrogramWindow,
  dims: Dims,
  relative: boolean = false,
): { time: number; freq: number } {
  const { width, height } = dims;
  const { x, y } = position;
  const time = scaleXToWindow(x, window, width, relative);
  const freq = scaleYToWindow(y, window, height, relative);
  return { time, freq };
}

export function scaleOnsetToViewport(
  dims: Dims,
  onset: Onset,
  window: SpectrogramWindow,
): Onset {
  const { width } = dims;
  return scaleTimeToViewport(onset, window, width);
}

export function scaleOnsetToWindow(
  dims: Dims,
  onset: Onset,
  window: SpectrogramWindow,
): Onset {
  const { width } = dims;
  return scaleXToWindow(onset, window, width);
}

export function scaleIntervalToViewport(
  dims: Dims,
  interval: Interval,
  window: SpectrogramWindow,
): Interval {
  const { width } = dims;
  let [start, end] = interval;
  start = scaleTimeToViewport(start, window, width);
  end = scaleTimeToViewport(end, window, width);
  return [start, end];
}

export function scaleIntervalToWindow(
  dims: Dims,
  interval: Interval,
  window: SpectrogramWindow,
): Interval {
  const { width } = dims;
  let [start, end] = interval;
  start = scaleXToWindow(start, window, width);
  end = scaleXToWindow(end, window, width);
  return [start, end];
}

export function scaleBBoxToViewport(
  dims: Dims,
  bbox: BBox,
  window: SpectrogramWindow,
): BBox {
  const { width, height } = dims;
  const [startTime, lowFreq, endTime, highFreq] = bbox;
  const start = scaleTimeToViewport(startTime, window, width);
  const end = scaleTimeToViewport(endTime, window, width);
  const top = scaleFreqToViewport(highFreq, window, height);
  const bottom = scaleFreqToViewport(lowFreq, window, height);
  return [start, top, end, bottom];
}

export function scaleBBoxToWindow(
  dims: Dims,
  bbox: BBox,
  window: SpectrogramWindow,
): BBox {
  const { width, height } = dims;
  let [start, top, end, bottom] = bbox;
  const startTime = scaleXToWindow(start, window, width);
  const endTime = scaleXToWindow(end, window, width);
  const lowFreq = scaleYToWindow(top, window, height);
  const highFreq = scaleYToWindow(bottom, window, height);
  return [startTime, lowFreq, endTime, highFreq];
}

function scalePositionToViewport(
  { width, height }: Dims,
  position: Position,
  window: SpectrogramWindow,
): Position {
  let [x, y] = position;
  x = scaleTimeToViewport(x, window, width);
  y = scaleFreqToViewport(y, window, height);
  return [x, y];
}

function scalePositionToWindow(
  { width, height }: Dims,
  position: Position,
  window: SpectrogramWindow,
): Position {
  let [x, y] = position;
  x = scaleXToWindow(x, window, width);
  y = scaleYToWindow(y, window, height);
  return [x, y];
}

function scalePathToViewport(
  dims: Dims,
  path: Position[],
  window: SpectrogramWindow,
): Position[] {
  return path.map((pos) => scalePositionToViewport(dims, pos, window));
}

function scalePathToWindow(
  dims: Dims,
  path: Position[],
  window: SpectrogramWindow,
): Position[] {
  return path.map((pos) => scalePositionToWindow(dims, pos, window));
}

function scalePathArrayToViewport(
  dims: Dims,
  pathArray: Position[][],
  window: SpectrogramWindow,
): Position[][] {
  return pathArray.map((path) => scalePathToViewport(dims, path, window));
}

function scalePathArrayToWindow(
  dims: Dims,
  pathArray: Position[][],
  window: SpectrogramWindow,
): Position[][] {
  return pathArray.map((path) => scalePathToWindow(dims, path, window));
}

export function scaleGeometryToViewport<T extends Geometry>(
  dims: Dims,
  geometry: T,
  window: SpectrogramWindow,
): T {
  const { type } = geometry;

  switch (type) {
    case "TimeStamp":
      return {
        ...geometry,
        coordinates: scaleTimeToViewport(
          geometry.coordinates,
          window,
          dims.width,
        ),
      };
    case "TimeInterval":
      return {
        ...geometry,
        coordinates: scaleIntervalToViewport(
          dims,
          // @ts-ignore
          geometry.coordinates,
          window,
        ),
      };
    case "Point":
      return {
        ...geometry,
        coordinates: scalePositionToViewport(
          dims,
          geometry.coordinates,
          window,
        ),
      };
    case "BoundingBox":
      return {
        ...geometry,
        // @ts-ignore
        coordinates: scaleBBoxToViewport(dims, geometry.coordinates, window),
      };
    case "MultiPoint":
      return {
        ...geometry,
        coordinates: scalePathToViewport(dims, geometry.coordinates, window),
      };
    case "LineString":
      return {
        ...geometry,
        coordinates: scalePathToViewport(dims, geometry.coordinates, window),
      };
    case "MultiLineString":
      return {
        ...geometry,
        coordinates: scalePathArrayToViewport(
          dims,
          geometry.coordinates,
          window,
        ),
      };
    case "Polygon":
      return {
        ...geometry,
        coordinates: scalePathArrayToViewport(
          dims,
          geometry.coordinates,
          window,
        ),
      };
    case "MultiPolygon":
      return {
        ...geometry,
        coordinates: geometry.coordinates.map((polygon) =>
          scalePathArrayToViewport(dims, polygon, window),
        ),
      };

    default:
      // eslint-disable-next-line no-console
      console.error(`Unknown geometry type ${type} at scaling`);
      return geometry;
  }
}

export function scaleGeometryToWindow<T extends Geometry>(
  dims: Dims,
  geometry: T,
  window: SpectrogramWindow,
): T {
  const { type } = geometry;

  switch (type) {
    case "TimeStamp":
      return {
        ...geometry,
        coordinates: scaleXToWindow(geometry.coordinates, window, dims.width),
      };
    case "TimeInterval":
      return {
        ...geometry,
        // @ts-ignore
        coordinates: scaleIntervalToWindow(dims, geometry.coordinates, window),
      };
    case "BoundingBox":
      return {
        ...geometry,
        // @ts-ignore
        coordinates: scaleBBoxToWindow(dims, geometry.coordinates, window),
      };
    case "Point":
      return {
        ...geometry,
        coordinates: scalePositionToWindow(dims, geometry.coordinates, window),
      };
    case "MultiPoint":
      return {
        ...geometry,
        coordinates: scalePathToWindow(dims, geometry.coordinates, window),
      };
    case "LineString":
      return {
        ...geometry,
        coordinates: scalePathToWindow(dims, geometry.coordinates, window),
      };
    case "MultiLineString":
      return {
        ...geometry,
        coordinates: scalePathArrayToWindow(dims, geometry.coordinates, window),
      };
    case "Polygon":
      return {
        ...geometry,
        coordinates: scalePathArrayToWindow(dims, geometry.coordinates, window),
      };
    case "MultiPolygon":
      return {
        ...geometry,
        coordinates: geometry.coordinates.map((polygon) =>
          scalePathArrayToWindow(dims, polygon, window),
        ),
      };

    default:
      // eslint-disable-next-line no-console
      console.error(`Unknown geometry type ${type} at scaling`);
      return geometry;
  }
}

const IS_CLOSE_THRESHOLD = 5;

export function isCloseToOnset(
  position: Position,
  onset: Onset,
  threshold = IS_CLOSE_THRESHOLD,
): boolean {
  const [x] = position;
  return Math.abs(onset - x) < threshold;
}

export function isCloseToInterval(
  position: Position,
  interval: Interval,
  threshold = IS_CLOSE_THRESHOLD,
): boolean {
  const [x] = position;
  const [start, end] = interval;
  return x > start - threshold && x < end + threshold;
}

export function isCloseToBBox(
  position: Position,
  bbox: BBox,
  threshold = IS_CLOSE_THRESHOLD,
): boolean {
  const [x, y] = position;
  const [left, top, right, bottom] = bbox;
  return (
    x > left - threshold &&
    x < right + threshold &&
    y > top - threshold &&
    y < bottom + threshold
  );
}

function distance(point1: Position, point2: Position): number {
  const [x1, y1] = point1;
  const [x2, y2] = point2;
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

export function isCloseToPoint(
  position: Position,
  geometry: Point,
  threshold = IS_CLOSE_THRESHOLD,
): boolean {
  return distance(position, geometry.coordinates) < threshold;
}

export function isCloseToMultiPoint(
  position: Position,
  geometry: MultiPoint,
  threshold = IS_CLOSE_THRESHOLD,
): boolean {
  return (
    Math.min(...geometry.coordinates.map((pos) => distance(position, pos))) <
    threshold
  );
}

function pointToEdgeDistance(
  point: Position,
  edge: [Position, Position],
): number {
  const [start, end] = edge;
  const l2 = distance(start, end) ** 2;
  if (l2 === 0) return distance(point, start);

  let t =
    ((point[0] - start[0]) * (end[0] - start[0]) +
      (point[1] - start[1]) * (end[1] - start[1])) /
    l2;

  t = Math.max(0, Math.min(1, t));

  const closest: Position = [
    start[0] + t * (end[0] - start[0]),
    start[1] + t * (end[1] - start[1]),
  ];

  return distance(point, closest);
}

function pointToLineDistance(point: Position, linestring: LineString): number {
  const distances = linestring.coordinates.slice(1).map((end, index) => {
    const start = linestring.coordinates[index];
    return pointToEdgeDistance(point, [start, end]);
  });
  return Math.min(...distances);
}

export function isCloseToLineString(
  position: Position,
  geometry: LineString,
  threshold = IS_CLOSE_THRESHOLD,
): boolean {
  const dist = pointToLineDistance(position, {
    type: "LineString",
    coordinates: geometry.coordinates,
  });
  return dist < threshold;
}

export function isCloseToMultiLineString(
  position: Position,
  geometry: MultiLineString,
  threshold = IS_CLOSE_THRESHOLD,
): boolean {
  return geometry.coordinates.some((linestring) =>
    isCloseToLineString(
      position,
      {
        type: "LineString",
        coordinates: linestring,
      },
      threshold,
    ),
  );
}

export function isCloseToPolygon(
  position: Position,
  geometry: Polygon,
): boolean {
  return booleanPointInPolygon(position, geometry);
}

export function isCloseToMultiPolygon(
  position: Position,
  geometry: MultiPolygon,
): boolean {
  return geometry.coordinates.some((polygon) =>
    isCloseToPolygon(position, {
      type: "Polygon",
      coordinates: polygon,
    }),
  );
}

export function isCloseToGeometry(
  position: Position,
  geometry: Geometry,
  threshold = IS_CLOSE_THRESHOLD,
): boolean {
  switch (geometry.type) {
    case "TimeStamp":
      return isCloseToOnset(position, geometry.coordinates, threshold);
    case "TimeInterval":
      // @ts-ignore
      return isCloseToInterval(position, geometry.coordinates, threshold);
    case "BoundingBox":
      // @ts-ignore
      return isCloseToBBox(position, geometry.coordinates, threshold);
    case "Point":
      return isCloseToPoint(position, geometry, threshold);
    case "MultiPoint":
      return isCloseToMultiPoint(position, geometry, threshold);
    case "LineString":
      return isCloseToLineString(position, geometry, threshold);
    case "MultiLineString":
      return isCloseToMultiLineString(position, geometry, threshold);
    case "Polygon":
      return isCloseToPolygon(position, geometry);
    case "MultiPolygon":
      return isCloseToMultiPolygon(position, geometry);
    default:
      return false;
  }
}

export function shiftPoint(geom: Point, start: Position, end: Position): Point {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const [x, y] = geom.coordinates;
  return {
    ...geom,
    coordinates: [x + dx, y + dy],
  };
}

export function shiftMultiPoint(
  geom: MultiPoint,
  start: Position,
  end: Position,
): MultiPoint {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  return {
    ...geom,
    coordinates: geom.coordinates.map(([x, y]) => [x + dx, y + dy]),
  };
}

export function shiftLineString(
  geom: LineString,
  start: Position,
  end: Position,
): LineString {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  return {
    ...geom,
    coordinates: geom.coordinates.map((point) => [
      point[0] + dx,
      point[1] + dy,
    ]),
  };
}

export function shiftMultiLineString(
  geom: MultiLineString,
  start: Position,
  end: Position,
): MultiLineString {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  return {
    ...geom,
    coordinates: geom.coordinates.map((points) =>
      points.map(([x, y]) => [x + dx, y + dy]),
    ),
  };
}

export function shiftPolygon(
  geom: Polygon,
  start: Position,
  end: Position,
): Polygon {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  return {
    ...geom,
    coordinates: geom.coordinates.map((points) =>
      points.map(([x, y]) => [x + dx, y + dy]),
    ),
  };
}

export function shiftMultiPolygon(
  geom: MultiPolygon,
  start: Position,
  end: Position,
): MultiPolygon {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  return {
    ...geom,
    coordinates: geom.coordinates.map((polygon) =>
      polygon.map((points) => points.map(([x, y]) => [x + dx, y + dy])),
    ),
  };
}

export function shiftTimeStamp(
  geom: TimeStamp,
  start: Position,
  end: Position,
): TimeStamp {
  const dx = end[0] - start[0];
  return {
    ...geom,
    coordinates: geom.coordinates + dx,
  };
}

export function shiftTimeInterval(
  geom: TimeInterval,
  start: Position,
  end: Position,
): TimeInterval {
  const dx = end[0] - start[0];
  return {
    ...geom,
    coordinates: [geom.coordinates[0] + dx, geom.coordinates[1] + dx],
  };
}

export function shiftBoundingBox(
  geom: BoundingBox,
  start: Position,
  end: Position,
): BoundingBox {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  return {
    ...geom,
    coordinates: [
      geom.coordinates[0] + dx,
      geom.coordinates[1] + dy,
      geom.coordinates[2] + dx,
      geom.coordinates[3] + dy,
    ],
  };
}

export function shiftGeometry(
  geom: Geometry,
  start: Position,
  end: Position,
): Geometry {
  const { type } = geom;
  switch (type) {
    case "TimeStamp":
      return shiftTimeStamp(geom, start, end);

    case "TimeInterval":
      return shiftTimeInterval(geom, start, end);

    case "BoundingBox":
      return shiftBoundingBox(geom, start, end);

    case "Point":
      return shiftPoint(geom, start, end);

    case "MultiPoint":
      return shiftMultiPoint(geom, start, end);

    case "LineString":
      return shiftLineString(geom, start, end);

    case "MultiLineString":
      return shiftMultiLineString(geom, start, end);

    case "Polygon":
      return shiftPolygon(geom, start, end);

    case "MultiPolygon":
      return shiftMultiPolygon(geom, start, end);

    default:
      throw Error(`Cannot shift geometry of unknown type ${type}`);
  }
}

export function isTimeStampInWindow(
  geom: TimeStamp,
  window: SpectrogramWindow,
): boolean {
  const { time } = window;
  return geom.coordinates >= time.min && geom.coordinates <= time.max;
}

export function isTimeIntervalInWindow(
  geom: TimeInterval,
  window: SpectrogramWindow,
): boolean {
  const { time } = window;
  const [start, end] = geom.coordinates;
  return end >= time.min && start <= time.max;
}

export function isBoundingBoxInWindow(
  geom: BoundingBox,
  window: SpectrogramWindow,
) {
  const { time, freq } = window;
  const [startTime, lowFreq, endTime, highFreq] = geom.coordinates;
  return (
    startTime <= time.max &&
    endTime >= time.min &&
    lowFreq <= freq.max &&
    highFreq >= freq.min
  );
}

export function isPointInWindow(geom: Point, window: SpectrogramWindow) {
  const { time, freq } = window;
  const [x, y] = geom.coordinates;
  return x <= time.max && x >= time.min && y <= freq.max && y >= freq.min;
}

export function isLineStringInWindow(
  geom: LineString,
  window: SpectrogramWindow,
) {
  const bbox = computeGeometryBBox(geom);
  return isBoundingBoxInWindow(
    { type: "BoundingBox", coordinates: bbox },
    window,
  );
}

export function isPolygonInWindow(geom: Polygon, window: SpectrogramWindow) {
  const bbox = computeGeometryBBox(geom);
  return isBoundingBoxInWindow(
    { type: "BoundingBox", coordinates: bbox },
    window,
  );
}

export function isMultiPointInWindow(
  geom: MultiPoint,
  window: SpectrogramWindow,
) {
  const { time, freq } = window;
  return geom.coordinates.some(([x, y]) => {
    return x <= time.max && x >= time.min && y <= freq.max && y >= freq.min;
  });
}

export function isMultiLineStringInWindow(
  geom: MultiLineString,
  window: SpectrogramWindow,
) {
  return geom.coordinates.some((line) => {
    return isLineStringInWindow(
      {
        type: "LineString",
        coordinates: line,
      },
      window,
    );
  });
}

export function isMultiPolygonInWindow(
  geom: MultiPolygon,
  window: SpectrogramWindow,
) {
  return geom.coordinates.some((polygon) => {
    return isPolygonInWindow(
      {
        type: "Polygon",
        coordinates: polygon,
      },
      window,
    );
  });
}

export function isGeometryInWindow(
  geom: Geometry,
  window: SpectrogramWindow,
): boolean {
  const { type } = geom;
  switch (type) {
    case "TimeStamp":
      return isTimeStampInWindow(geom, window);

    case "TimeInterval":
      return isTimeIntervalInWindow(geom, window);

    case "BoundingBox":
      return isBoundingBoxInWindow(geom, window);

    case "Point":
      return isPointInWindow(geom, window);

    case "MultiPoint":
      return isMultiPointInWindow(geom, window);

    case "LineString":
      return isLineStringInWindow(geom, window);

    case "MultiLineString":
      return isMultiLineStringInWindow(geom, window);

    case "Polygon":
      return isPolygonInWindow(geom, window);

    case "MultiPolygon":
      return isMultiPolygonInWindow(geom, window);

    default:
      throw Error(
        `Cannot check if geometry of unknown type ${type} is in window`,
      );
  }
}

export function computeTimeStampBBox(geometry: TimeStamp): BBox {
  return [geometry.coordinates, 0, geometry.coordinates, MAX_FREQ];
}

export function computeTimeIntervalBBox(geometry: TimeInterval): BBox {
  return [geometry.coordinates[0], 0, geometry.coordinates[1], MAX_FREQ];
}

export function computeBoundingBoxBBox(geometry: BoundingBox): BBox {
  // @ts-ignore
  return geometry.coordinates;
}

export function computeGeometryBBox(geometry: Geometry): BBox {
  const { type } = geometry;
  switch (type) {
    case "TimeStamp":
      return computeTimeStampBBox(geometry);

    case "TimeInterval":
      return computeTimeIntervalBBox(geometry);

    case "BoundingBox":
      return computeBoundingBoxBBox(geometry);

    case "Point":
      return bbox(geometry);

    case "MultiPoint":
      return bbox(geometry);

    case "LineString":
      return bbox(geometry);

    case "MultiLineString":
      return bbox(geometry);

    case "Polygon":
      return bbox(geometry);

    case "MultiPolygon":
      return bbox(geometry);

    default:
      throw Error(
        `Cannot compute bounding box of unknown geometry type ${type}`,
      );
  }
}
