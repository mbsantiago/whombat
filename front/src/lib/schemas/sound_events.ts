import { z } from "zod";

import { FeatureSchema } from "./features";
import { GeometrySchema, GeometryTypeSchema } from "./geometries";

export const SoundEventSchema = z.object({
  uuid: z.string().uuid(),
  geometry: GeometrySchema,
  geometry_type: GeometryTypeSchema,
  features: z.array(FeatureSchema).nullish(),
  created_on: z.coerce.date(),
});

export const SoundEventCreateSchema = z.object({
  geometry: GeometrySchema,
});

export const SoundEventUpdateSchema = z.object({
  geometry: GeometrySchema,
});
