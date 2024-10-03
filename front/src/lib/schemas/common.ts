import { z } from "zod";

export const TimeStringSchema = z.string().regex(/^\d{2}:\d{2}:\d{2}(\.\d+)?$/);

export const GetManySchema = z.object({
  limit: z.number().int().gte(-1).optional(),
  offset: z.number().int().gte(0).optional(),
  sort_by: z.string().optional(),
});

export const FileSchema = z
  .any()
  .refine((files) => files?.length == 1, "File is required.");
