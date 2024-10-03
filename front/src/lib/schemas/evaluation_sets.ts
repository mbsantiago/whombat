"use client";

import { z } from "zod";

import { TagSchema } from "./tags";

export const PREDICTION_TYPES = [
  "Clip Classification",
  "Clip Tagging",
  "Sound Event Detection",
  "Sound Event Tagging",
] as const;

export const EvaluationSetSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  description: z.string().nullish(),
  task: z.enum(PREDICTION_TYPES),
  tags: z.array(TagSchema).nullish(),
  created_on: z.coerce.date(),
});

export const EvaluationSetCreateSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  task: z.enum(PREDICTION_TYPES),
});

export const EvaluationSetUpdateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

export const EvaluationSetImportSchema = z.object({
  evaluation_set: z
    .any()
    .refine((files) => files?.length == 1, "File is required."),
  task: z.string(),
});
