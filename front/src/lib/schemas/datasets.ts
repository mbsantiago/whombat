"use client";

import { z } from "zod";

import { FileSchema } from "./common";

export const DatasetSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  audio_dir: z.string(),
  description: z.string().nullable().default(""),
  recording_count: z.number().int().default(0),
  created_on: z.coerce.date(),
});

export const DatasetCreateSchema = z.object({
  uuid: z.string().uuid().optional(),
  name: z.string().min(1),
  audio_dir: z.string(),
  description: z.string().optional(),
  tag_recordings_by_folder: z.boolean().default(false),
  include_subfolders: z.boolean().default(true),
});

export const DatasetUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

export const DatasetImportSchema = z.object({
  dataset: FileSchema,
  audio_dir: z.string(),
});

export const DatasetDirectorySchema = z.object({
  name: z.string(),
  path: z.string(),
  absolute: z.string(),
});

export const DatasetDirectoryBrowseSchema = z.object({
  path: z.string(),
  absolute: z.string(),
  parent: z.string().nullable(),
  directories: z.array(DatasetDirectorySchema),
});
