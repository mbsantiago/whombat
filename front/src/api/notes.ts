import { z } from "zod";

import { SimpleUserSchema } from "@/api/user";

export const NoteCreateSchema = z.object({
  message: z.string(),
  is_issue: z.boolean(),
});

export type NoteCreate = z.infer<typeof NoteCreateSchema>;

export const NoteSchema = NoteCreateSchema.extend({
  id: z.number().int(),
  created_at: z.coerce.date(),
  created_by: SimpleUserSchema,
});

export type Note = z.infer<typeof NoteSchema>;

export const NoteUpdateSchema = z.object({
  message: z.string().optional(),
  is_issue: z.boolean().optional(),
});

export type NoteUpdate = z.infer<typeof NoteUpdateSchema>;

export const NoteFilterSchema = z.object({
  is_issue__eq: z.boolean().optional(),
  created_by__eq: z.number().int().optional(),
  search: z.string().optional(),
  recording__eq: z.number().int().optional(),
  task__eq: z.number().int().optional(),
  sound_event__eq: z.number().int().optional(),
});

export type NoteFilter = z.infer<typeof NoteFilterSchema>;
