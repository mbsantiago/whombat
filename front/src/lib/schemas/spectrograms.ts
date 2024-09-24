import { z } from "zod";

export const IntervalSchema = z
  .object({
    min: z.number(),
    max: z.number(),
  })
  .refine((data) => data.min < data.max, {
    message: "min must be less than max",
    path: ["min"],
  });

export const SpectrogramWindowSchema = z.object({
  time: IntervalSchema,
  freq: IntervalSchema,
});
