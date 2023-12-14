import { z } from "zod";
import { AxiosInstance } from "axios";

import { GetManySchema, Page } from "@/api/common";
import { NoteSchema, type Note } from "@/api/schemas";

export const NotePageSchema = Page(NoteSchema);

export type NotePage = z.infer<typeof NotePageSchema>;

export const NoteCreateSchema = z.object({
  message: z.string(),
  is_issue: z.boolean(),
});

export type NoteCreate = z.input<typeof NoteCreateSchema>;

export const NoteUpdateSchema = z.object({
  message: z.string().optional(),
  is_issue: z.boolean().optional(),
});

export type NoteUpdate = z.input<typeof NoteUpdateSchema>;

export const NoteFilterSchema = z.object({
  is_issue__eq: z.boolean().optional(),
  created_by__eq: z.number().int().optional(),
  search: z.string().optional(),
  recording__eq: z.number().int().optional(),
  task__eq: z.number().int().optional(),
  sound_event__eq: z.number().int().optional(),
});

export type NoteFilter = z.infer<typeof NoteFilterSchema>;

export const GetNotesQuerySchema = z.intersection(
  GetManySchema,
  NoteFilterSchema,
);

export type GetNotesQuery = z.infer<typeof GetNotesQuerySchema>;

const DEFAULT_ENDPOINTS = {
  getMany: "/api/v1/notes/",
  update: "/api/v1/notes/detail/",
};

export function registerNotesAPI(
  instance: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  async function getManyNotes(query: GetNotesQuery): Promise<NotePage> {
    let params = GetNotesQuerySchema.parse(query);
    let response = await instance.get(endpoints.getMany, { params });
    return NoteSchema.parse(response.data);
  }

  async function updateNote(note: Note, data: NoteUpdate): Promise<Note> {
    let body = NoteUpdateSchema.parse(data);
    let response = await instance.patch(endpoints.update, body, {
      params: { note_uuid: note.uuid },
    });
    return NoteSchema.parse(response.data);
  }

  return {
    update: updateNote,
    getMany: getManyNotes,
  };
}
