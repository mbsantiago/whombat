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
  search: z.string().optional(),
  created_by__eq: z.string().uuid().optional(),
  recording__eq: z.string().uuid().optional(),
  annotation_task__eq: z.string().uuid().optional(),
  sound_event__eq: z.string().uuid().optional(),
  dataset__eq: z.string().uuid().optional(),
});

export type NoteFilter = z.input<typeof NoteFilterSchema>;

export const GetNotesQuerySchema = z.intersection(
  GetManySchema,
  NoteFilterSchema,
);

export type GetNotesQuery = z.input<typeof GetNotesQuerySchema>;

const DEFAULT_ENDPOINTS = {
  getMany: "/api/v1/notes/",
  update: "/api/v1/notes/detail/",
  get: "/api/v1/notes/detail/",
  delete: "/api/v1/notes/detail/",
};

export function registerNotesAPI(
  instance: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  async function getNote(uuid: string): Promise<Note> {
    let response = await instance.get(endpoints.get, { params: { uuid } });
    return NoteSchema.parse(response.data);
  }

  async function getManyNotes(query: GetNotesQuery): Promise<NotePage> {
    let params = GetNotesQuerySchema.parse(query);
    let response = await instance.get(endpoints.getMany, { params });
    return NotePageSchema.parse(response.data);
  }

  async function updateNote(note: Note, data: NoteUpdate): Promise<Note> {
    let body = NoteUpdateSchema.parse(data);
    let response = await instance.patch(endpoints.update, body, {
      params: { note_uuid: note.uuid },
    });
    return NoteSchema.parse(response.data);
  }

  async function deleteNote(note: Note): Promise<Note> {
    let response = await instance.delete(endpoints.delete, {
      params: { note_uuid: note.uuid },
    });
    return NoteSchema.parse(response.data);
  }

  return {
    get: getNote,
    update: updateNote,
    getMany: getManyNotes,
    delete: deleteNote,
  };
}
