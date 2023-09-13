import { z } from "zod";
import { AxiosInstance } from "axios";

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

const DEFAULT_ENDPOINTS = {
  update: "/api/v1/notes/detail/",
};

export function registerNotesAPI(
  instance: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  async function update(note_id: number, data: NoteUpdate) {
    let body = NoteUpdateSchema.parse(data);
    let response = await instance.patch<Note>(`${endpoints.update}`, body, {
      params: { note_id },
    });
    return NoteSchema.parse(response.data);
  }

  return {
    update,
  };
}
