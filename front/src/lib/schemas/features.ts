import { z } from "zod";

export const FeatureSchema = z.object({
  name: z.string(),
  value: z.number(),
});
