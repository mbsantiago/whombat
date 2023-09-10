import { z } from "zod";

export const FeatureNameSchema = z.object({
  id: z.number().int(),
  name: z.string(),
});

export type FeatureName = z.infer<typeof FeatureNameSchema>;

export const FeatureSchema = z.object({
  feature_name: FeatureNameSchema,
  value: z.number(),
});

export type Feature = z.infer<typeof FeatureSchema>;

