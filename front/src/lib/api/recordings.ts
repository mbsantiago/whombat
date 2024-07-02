import { AxiosInstance } from "axios";
import { z } from "zod";

import { GetManySchema, Page } from "@/lib/api/common";
import {
  DatasetSchema,
  DateFilterSchema,
  IntegerFilterSchema,
  NumberFilterSchema,
  RecordingSchema,
  TagSchema,
  TimeFilterSchema,
  TimeStringSchema,
} from "@/schemas";

import type { NoteCreate } from "@/lib/api/notes";
import type { Feature, Note, Recording, Tag } from "@/types";

export const RecordingPageSchema = Page(RecordingSchema);

export type RecordingPage = z.infer<typeof RecordingPageSchema>;

export const RecordingUpdateSchema = z.object({
  date: z.coerce.date().nullish(),
  time: TimeStringSchema.nullish(),
  latitude: z.number().nullish(),
  longitude: z.number().nullish(),
  rights: z.string().nullish(),
  time_expansion: z.coerce.number().optional(),
});

export type RecordingUpdate = z.input<typeof RecordingUpdateSchema>;

export const RecordingFilterSchema = z.object({
  search: z.string().optional(),
  dataset: DatasetSchema.optional(),
  duration: NumberFilterSchema.optional(),
  samplerate: IntegerFilterSchema.optional(),
  channels: IntegerFilterSchema.optional(),
  time_expansion: NumberFilterSchema.optional(),
  latitude: NumberFilterSchema.optional(),
  longitude: NumberFilterSchema.optional(),
  tag: TagSchema.optional(),
  has_issues: z.boolean().optional(),
  date: DateFilterSchema.optional(),
  time: TimeFilterSchema.optional(),
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
    const { data } = await instance.get(endpoints.getMany, {
      params: {
        limit: params.limit,
        offset: params.offset,
        sort_by: params.sort_by,
        search: params.search,
        dataset__eq: params.dataset?.uuid,
        duration__gt: params.duration?.gt,
        duration__lt: params.duration?.lt,
        latitude__gt: params.latitude?.gt,
        latitude__lt: params.latitude?.lt,
        latitude__is_null: params.latitude?.is_null,
        longitude__gt: params.longitude?.gt,
        longitude__lt: params.longitude?.lt,
        longitude__is_null: params.longitude?.is_null,
        time_expansion__gt: params.time_expansion?.gt,
        time_expansion__lt: params.time_expansion?.lt,
        tag__key: params.tag?.key,
        tag__value: params.tag?.value,
        has_issues__eq: params.has_issues,
        date__before: params.date?.before,
        date__after: params.date?.after,
        date__on: params.date?.on,
        date__is_null: params.date?.is_null,
        time__before: params.time?.before,
        time__after: params.time?.after,
        time__is_null: params.time?.is_null,
      },
    });
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
