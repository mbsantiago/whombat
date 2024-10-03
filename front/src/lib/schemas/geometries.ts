import { z } from "zod";

export const GeometryTypeSchema = z.enum([
  "TimeStamp",
  "TimeInterval",
  "BoundingBox",
  "Point",
  "LineString",
  "Polygon",
  "MultiPoint",
  "MultiLineString",
  "MultiPolygon",
]);

export const TimeStampSchema = z.object({
  type: z.literal("TimeStamp"),
  coordinates: z.number(),
});

export const TimeIntervalSchema = z.object({
  type: z.literal("TimeInterval"),
  coordinates: z.array(z.number()),
});

export const BoundingBoxSchema = z.object({
  type: z.literal("BoundingBox"),
  coordinates: z.array(z.number()),
});

export const PointSchema = z.object({
  type: z.literal("Point"),
  coordinates: z.array(z.number()),
});

export const LineStringSchema = z.object({
  type: z.literal("LineString"),
  coordinates: z.array(z.array(z.number())),
});

export const PolygonSchema = z.object({
  type: z.literal("Polygon"),
  coordinates: z.array(z.array(z.array(z.number()))),
});

export const MultiPointSchema = z.object({
  type: z.literal("MultiPoint"),
  coordinates: z.array(z.array(z.number())),
});

export const MultiLineStringSchema = z.object({
  type: z.literal("MultiLineString"),
  coordinates: z.array(z.array(z.array(z.number()))),
});

export const MultiPolygonSchema = z.object({
  type: z.literal("MultiPolygon"),
  coordinates: z.array(z.array(z.array(z.array(z.number())))),
});

export const GeometrySchema = z.discriminatedUnion("type", [
  TimeStampSchema,
  TimeIntervalSchema,
  BoundingBoxSchema,
  PointSchema,
  LineStringSchema,
  PolygonSchema,
  MultiPointSchema,
  MultiLineStringSchema,
  MultiPolygonSchema,
]);
