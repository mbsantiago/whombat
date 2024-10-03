"use client";

import { z } from "zod";

import { FileSchema } from "./common";

export const ModelRunSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  version: z.string(),
  description: z.string().nullish(),
  created_on: z.coerce.date(),
});

export const ModelRunUpdateSchema = z.object({
  name: z.string().optional(),
  version: z.string().optional(),
  description: z.string().optional(),
});

export const ModelRunImportSchema = z.object({
  evaluation_set_uuid: z.string().uuid(),
  model_run: FileSchema,
});
