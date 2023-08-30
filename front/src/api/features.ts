import { z } from "zod";

const FeatureNameSchema = z.object({
  id: z.number().int(),
  name: z.string(),
});

const FeatureSchema = z.object({
  feature_name: FeatureNameSchema,
  value: z.number(),
});

export { FeatureSchema, FeatureNameSchema };
