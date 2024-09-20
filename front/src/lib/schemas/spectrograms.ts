import { z } from "zod";

export const IntervalSchema = z.object({
  min: z.number(),
  max: z.number(),
});

export const SpectrogramWindowSchema = z.object({
  time: IntervalSchema,
  freq: IntervalSchema,
});
