import { z } from "zod";

import * as schemas from "@/lib/schemas";

export type GeometryType = z.infer<typeof schemas.GeometryTypeSchema>;

export type TimeStamp = z.infer<typeof schemas.TimeStampSchema>;

export type TimeInterval = z.infer<typeof schemas.TimeIntervalSchema>;

export type BoundingBox = z.infer<typeof schemas.BoundingBoxSchema>;

export type Point = z.infer<typeof schemas.PointSchema>;

export type LineString = z.infer<typeof schemas.LineStringSchema>;

export type Polygon = z.infer<typeof schemas.PolygonSchema>;

export type MultiPoint = z.infer<typeof schemas.MultiPointSchema>;

export type MultiLineString = z.infer<typeof schemas.MultiLineStringSchema>;

export type MultiPolygon = z.infer<typeof schemas.MultiPolygonSchema>;

export type Geometry = z.infer<typeof schemas.GeometrySchema>;

export type Coordinates = number[];

export type Box = [number, number, number, number];

export type Pixel = {
  x: number;
  y: number;
};

export type Dimensions = {
  width: number;
  height: number;
};
