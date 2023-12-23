import { z } from "zod";
import { AxiosInstance } from "axios";

import {
  RecordingSchema,
  type Recording,
  type Tag,
  type Note,
  type Feature,
} from "@/api/schemas";
import { type NoteCreate } from "@/api/notes";

import { GetManySchema, Page } from "./common";

export const RecordingPageSchema = Page(RecordingSchema);

export type RecordingPage = z.infer<typeof RecordingPageSchema>;

export const RecordingUpdateSchema = z.object({
  date: z.coerce.date().nullable().optional(),
  time: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/)
    .nullable()
    .optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  rights: z.string().nullable().optional(),
  time_expansion: z.coerce.number().optional(),
});

export type RecordingUpdate = z.input<typeof RecordingUpdateSchema>;

export const RecordingFilterSchema = z.object({
  search: z.string().optional(),
  dataset: z.string().uuid().optional(),
  duration__gt: z.number().optional(),
  duration__lt: z.number().optional(),
  duration__ge: z.number().optional(),
  duration__le: z.number().optional(),
  latitude__gt: z.number().optional(),
  latitude__lt: z.number().optional(),
  latitude__ge: z.number().optional(),
  latitude__le: z.number().optional(),
  latitude__is_null: z.boolean().optional(),
  longitude__gt: z.number().optional(),
  longitude__lt: z.number().optional(),
  longitude__ge: z.number().optional(),
  longitude__le: z.number().optional(),
  longitude__is_null: z.boolean().optional(),
  tag__key: z.string().optional(),
  tag__value: z.string().optional(),
  dataset__eq: z.string().uuid().optional(),
  has_issues__eq: z.boolean().optional(),
});

export type RecordingFilter = z.input<typeof RecordingFilterSchema>;

export const GetRecordingsQuerySchema = z.intersection(
  GetManySchema,
  RecordingFilterSchema,
);

export type GetRecordingsQuery = z.input<typeof GetRecordingsQuerySchema>;

const DEFAULT_ENDPOINTS = {
  getMany: "/api/v1/recordings/",
  get: "/api/v1/recordings/detail/",
  update: "/api/v1/recordings/detail/",
  delete: "/api/v1/recordings/detail/",
  addTag: "/api/v1/recordings/detail/tags/",
  removeTag: "/api/v1/recordings/detail/tags/",
  addNote: "/api/v1/recordings/detail/notes/",
  removeNote: "/api/v1/recordings/detail/notes/",
  addFeature: "/api/v1/recordings/detail/features/",
  removeFeature: "/api/v1/recordings/detail/features/",
  updateFeature: "/api/v1/recordings/detail/features/",
};

export function registerRecordingAPI(
  instance: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  async function getMany(query: GetRecordingsQuery): Promise<RecordingPage> {
    const params = GetRecordingsQuerySchema.parse(query);
    const { data } = await instance.get(endpoints.getMany, { params });
    return RecordingPageSchema.parse(data);
  }

  async function get(uuid: string): Promise<Recording> {
    const { data } = await instance.get(endpoints.get, {
      params: { recording_uuid: uuid },
    });
    return RecordingSchema.parse(data);
  }

  async function update(
    recording: Recording,
    data: RecordingUpdate,
  ): Promise<Recording> {
    const body = RecordingUpdateSchema.parse(data);
    const { data: res } = await instance.patch(endpoints.update, body, {
      params: { recording_uuid: recording.uuid },
    });
    return RecordingSchema.parse(res);
  }

  async function deleteRecording(recording: Recording): Promise<Recording> {
    const { data: res } = await instance.delete(endpoints.delete, {
      params: { recording_uuid: recording.uuid },
    });
    return RecordingSchema.parse(res);
  }

  async function addTag(recording: Recording, tag: Tag): Promise<Recording> {
    const { data } = await instance.post(
      endpoints.addTag,
      {},
      {
        params: {
          recording_uuid: recording.uuid,
          key: tag.key,
          value: tag.value,
        },
      },
    );
    return RecordingSchema.parse(data);
  }

  async function removeTag(recording: Recording, tag: Tag): Promise<Recording> {
    const { data } = await instance.delete(endpoints.removeTag, {
      params: {
        recording_uuid: recording.uuid,
        key: tag.key,
        value: tag.value,
      },
    });
    return RecordingSchema.parse(data);
  }

  async function addNote(
    recording: Recording,
    data: NoteCreate,
  ): Promise<Recording> {
    const { data: updated } = await instance.post(endpoints.addNote, data, {
      params: { recording_uuid: recording.uuid },
    });
    return RecordingSchema.parse(updated);
  }

  async function removeNote(
    recording: Recording,
    note: Note,
  ): Promise<Recording> {
    const { data } = await instance.delete(endpoints.removeNote, {
      params: {
        recording_uuid: recording.uuid,
        note_uuid: note.uuid,
      },
    });
    return RecordingSchema.parse(data);
  }

  async function addFeature(
    recording: Recording,
    feature: Feature,
  ): Promise<Recording> {
    const { data } = await instance.post(
      endpoints.addFeature,
      {},
      {
        params: {
          recording_uuid: recording.uuid,
          name: feature.name,
          value: feature.value,
        },
      },
    );
    return RecordingSchema.parse(data);
  }

  async function removeFeature(
    recording: Recording,
    feature: Feature,
  ): Promise<Recording> {
    const { data } = await instance.delete(endpoints.removeFeature, {
      params: {
        recording_uuid: recording.uuid,
        name: feature.name,
        value: feature.value,
      },
    });
    return RecordingSchema.parse(data);
  }

  async function updateFeature(
    recording: Recording,
    feature: Feature,
  ): Promise<Recording> {
    const { data } = await instance.patch(
      endpoints.updateFeature,
      {},
      {
        params: {
          recording_uuid: recording.uuid,
          name: feature.name,
          value: feature.value,
        },
      },
    );
    return RecordingSchema.parse(data);
  }

  return {
    getMany,
    get,
    update,
    delete: deleteRecording,
    addTag,
    removeTag,
    addNote,
    removeNote,
    addFeature,
    removeFeature,
    updateFeature,
  } as const;
}
