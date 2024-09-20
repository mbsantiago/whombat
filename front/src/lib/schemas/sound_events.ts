import { z } from "zod";

import { GeometrySchema, GeometryTypeSchema } from "./geometries";
import { FeatureSchema } from "./features";

export const SoundEventSchema = z.object({
  uuid: z.string().uuid(),
  geometry: GeometrySchema,
  geometry_type: GeometryTypeSchema,
  features: z.array(FeatureSchema).nullish(),
  created_on: z.coerce.date(),
});
