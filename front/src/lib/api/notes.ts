import { AxiosInstance } from "axios";
import { z } from "zod";

import { GetManySchema, Page } from "@/lib/api/common";
import {
  AnnotationTaskSchema,
  DatasetSchema,
  NoteSchema,
  RecordingSchema,
  SoundEventSchema,
  UserSchema,
} from "@/lib/schemas";

import type { Note } from "@/lib/types";

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
  is_issue: z.boolean().optional(),
  search: z.string().optional(),
  created_by: UserSchema.optional(),
  recording: RecordingSchema.optional(),
  annotation_task: AnnotationTaskSchema.optional(),
  sound_event: SoundEventSchema.optional(),
  dataset: DatasetSchema.optional(),
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
    let response = await instance.get(endpoints.getMany, {
      params: {
        limit: params.limit,
        offset: params.offset,
        sort_by: params.sort_by,
        is_issue__eq: params.is_issue,
        search: params.search,
        created_by__eq: params.created_by?.id,
        recording__eq: params.recording?.uuid,
        annotation_task__eq: params.annotation_task?.uuid,
        sound_event__eq: params.sound_event?.uuid,
        dataset__eq: params.dataset?.uuid,
      },
    });
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
