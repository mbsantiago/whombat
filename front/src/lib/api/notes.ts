import { AxiosInstance } from "axios";

import { GetMany, Page } from "@/lib/api/common";
import * as schemas from "@/lib/schemas";
import type * as types from "@/lib/types";

const DEFAULT_ENDPOINTS = {
  list: "/api/v1/notes/",
  detail: "/api/v1/notes/detail/",
  getRecordingNotes: "/api/v1/notes/recording_notes/",
  getClipAnnotationNotes: "/api/v1/notes/clip_annotation_notes/",
  getSoundEventAnnotationNotes: "/api/v1/notes/sound_event_annotation_notes/",
};

export function registerNotesAPI(
  instance: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  async function getNote(uuid: string): Promise<types.Note> {
    let response = await instance.get(endpoints.detail, {
      params: { note_uuid: uuid },
    });
    return schemas.NoteSchema.parse(response.data);
  }

  async function getManyNotes(
    query: types.GetMany & types.NoteFilter,
  ): Promise<types.Page<types.Note>> {
    let params = GetMany(schemas.NoteFilterSchema).parse(query);
    let response = await instance.get(endpoints.list, {
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
    return Page(schemas.NoteSchema).parse(response.data);
  }

  async function updateNote(
    note: types.Note,
    data: types.NoteUpdate,
  ): Promise<types.Note> {
    let body = schemas.NoteUpdateSchema.parse(data);
    let response = await instance.patch(endpoints.detail, body, {
      params: { note_uuid: note.uuid },
    });
    return schemas.NoteSchema.parse(response.data);
  }

  async function deleteNote(note: types.Note): Promise<types.Note> {
    let response = await instance.delete(endpoints.detail, {
      params: { note_uuid: note.uuid },
    });
    return schemas.NoteSchema.parse(response.data);
  }

  async function getRecordingNotes(
    query: types.GetMany & types.RecordingNoteFilter,
  ): Promise<types.Page<types.RecordingNote>> {
    const params = GetMany(schemas.RecordingNoteFilterSchema).parse(query);
    const response = await instance.get(endpoints.getRecordingNotes, {
      params: {
        limit: params.limit,
        offset: params.offset,
        sort_by: params.sort_by,
        created_by__eq: params.created_by?.id,
        created_on__before: params.created_on?.before,
        created_on__after: params.created_on?.after,
        created_on__on: params.created_on?.on,
        recording__eq: params.recording?.uuid,
        dataset__eq: params.dataset?.uuid,
        issues__eq: params.issues?.eq,
      },
    });
    return Page(schemas.RecordingNoteSchema).parse(response.data);
  }

  async function getClipAnnotationNotes(
    query: types.GetMany & types.ClipAnnotationNoteFilter,
  ): Promise<types.Page<types.ClipAnnotationNote>> {
    const params = GetMany(schemas.ClipAnnotationNoteFilterSchema).parse(query);
    const response = await instance.get(endpoints.getClipAnnotationNotes, {
      params: {
        limit: params.limit,
        offset: params.offset,
        sort_by: params.sort_by,
        created_by__eq: params.created_by?.id,
        created_on__before: params.created_on?.before,
        created_on__after: params.created_on?.after,
        created_on__on: params.created_on?.on,
        clip_annotation__eq: params.clip_annotation?.uuid,
        annotation_project__eq: params.annotation_project?.uuid,
        issues__eq: params.issues?.eq,
      },
    });
    return Page(schemas.ClipAnnotationNoteSchema).parse(response.data);
  }

  async function getSoundEventAnnotationNotes(
    query: types.GetMany & types.SoundEventAnnotationNoteFilter,
  ): Promise<types.Page<types.SoundEventAnnotationNote>> {
    const params = GetMany(schemas.SoundEventAnnotationNoteFilterSchema).parse(
      query,
    );
    const response = await instance.get(
      endpoints.getSoundEventAnnotationNotes,
      {
        params: {
          limit: params.limit,
          offset: params.offset,
          sort_by: params.sort_by,
          created_by__eq: params.created_by?.id,
          created_on__before: params.created_on?.before,
          created_on__after: params.created_on?.after,
          created_on__on: params.created_on?.on,
          clip_annotation__eq: params.clip_annotation?.uuid,
          sound_event_annotation__eq: params.sound_event_annotation?.uuid,
          annotation_project__eq: params.annotation_project?.uuid,
          issues__eq: params.issues?.eq,
        },
      },
    );
    return Page(schemas.SoundEventAnnotationNoteSchema).parse(response.data);
  }

  return {
    get: getNote,
    update: updateNote,
    getMany: getManyNotes,
    delete: deleteNote,
    getRecordingNotes,
    getClipAnnotationNotes,
    getSoundEventAnnotationNotes,
  };
}
