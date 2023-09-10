import { z } from "zod";
import { AxiosInstance } from "axios";
import { GetManySchema, Page } from "./common";
import { TagSchema } from "@/api/tags";
import { NoteSchema } from "@/api/notes";
import { FeatureSchema } from "@/api/features";

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
  getNotes: "/api/v1/recordings/notes/",
  getTags: "/api/v1/recordings/tags/",
};

// TODO: Add more filters
export const RecordingFilterSchema = z.object({
  search: z.string().optional(),
  dataset: z.number().int().optional(),
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
});

export type RecordingFilter = z.infer<typeof RecordingFilterSchema>;

export const RecordingSchema = z.object({
  id: z.number().int(),
  uuid: z.string().uuid(),
  path: z.string(),
  hash: z.string(),
  duration: z.number(),
  samplerate: z.number(),
  channels: z.number(),
  time_expansion: z.number().default(1),
  date: z.coerce.date().nullable(),
  time: z
    .string()
    .regex(/^\d{2}:\d{2}:\d{2}(\.\d+)?$/)
    .nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  created_at: z.coerce.date(),
  tags: z.array(TagSchema),
  notes: z.array(NoteSchema),
  features: z.array(FeatureSchema),
});

export type Recording = z.infer<typeof RecordingSchema>;

export const RecordingPageSchema = Page(RecordingSchema);

export const RecordingUpdateSchema = z.object({
  date: z.coerce.date().nullable().optional(),
  time: z
    .string()
    .regex(/^\d{2}:\d{2}:\d{2}(\.\d+)?$/)
    .nullable()
    .optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  time_expansion: z.coerce.number().optional(),
});

export type RecordingUpdate = z.infer<typeof RecordingUpdateSchema>;

export const GetRecordingsQuerySchema = z.intersection(
  GetManySchema,
  RecordingFilterSchema,
);

export const RecordingNoteSchema = z.object({
  recording_id: z.number().int(),
  note_id: z.number().int(),
  note: NoteSchema,
});

export type RecordingNote = z.infer<typeof RecordingNoteSchema>;

export const RecordingNoteFilter = z.object({
  recording__eq: z.number().int().optional(),
  note__eq: z.number().int().optional(),
  created_by__eq: z.string().uuid().optional(),
  dataset__eq: z.number().int().optional(),
  is_issue__eq: z.boolean().optional(),
  message__eq: z.string().optional(),
  message__has: z.string().optional(),
  created_at__before: z.coerce.date().optional(),
  created_at__after: z.coerce.date().optional(),
});

export type RecordingNoteFilter = z.infer<typeof RecordingNoteFilter>;

export const RecordingNotePageSchema = Page(RecordingNoteSchema);

export type RecordingNotePage = z.infer<typeof RecordingNotePageSchema>;

export const GetRecordingNotesQuerySchema = z.intersection(
  GetManySchema,
  RecordingNoteFilter,
);

export type GetRecordingNotesQuery = z.infer<
  typeof GetRecordingNotesQuerySchema
>;

export const RecordingTagSchema = z.object({
  recording_id: z.number().int(),
  tag_id: z.number().int(),
  tag: TagSchema,
});

export type RecordingTag = z.infer<typeof RecordingTagSchema>;

export const RecordingTagFilter = z.object({
  recording__eq: z.number().int().optional(),
  tag__eq: z.number().int().optional(),
  created_at__before: z.coerce.date().optional(),
  created_at__after: z.coerce.date().optional(),
  dataset__eq: z.number().int().optional(),
  search: z.string().optional(),
  key__eq: z.string().optional(),
  key__has: z.string().optional(),
  value__eq: z.string().optional(),
  value__has: z.string().optional(),
});

export type RecordingTagFilter = z.infer<typeof RecordingTagFilter>;

export const RecordingTagPageSchema = Page(RecordingTagSchema);

export type RecordingTagPage = z.infer<typeof RecordingTagPageSchema>;

export const GetRecordingTagsQuerySchema = z.intersection(
  GetManySchema,
  RecordingTagFilter,
);

export type GetRecordingTagsQuery = z.infer<typeof GetRecordingTagsQuerySchema>;

export function registerRecordingAPI(
  instance: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  async function getMany(
    query: z.infer<typeof GetRecordingsQuerySchema> = {},
  ): Promise<z.infer<typeof RecordingPageSchema>> {
    const params = GetRecordingsQuerySchema.parse(query);
    const { data } = await instance.get(endpoints.getMany, { params });
    return RecordingPageSchema.parse(data);
  }

  async function get(
    recording_id: number,
  ): Promise<z.infer<typeof RecordingSchema>> {
    const { data } = await instance.get(endpoints.get, {
      params: { recording_id },
    });
    return RecordingSchema.parse(data);
  }

  async function update(
    recording_id: number,
    data: z.infer<typeof RecordingUpdateSchema>,
  ): Promise<z.infer<typeof RecordingSchema>> {
    const body = RecordingUpdateSchema.parse(data);
    const { data: res } = await instance.patch(endpoints.update, body, {
      params: { recording_id },
    });
    return RecordingSchema.parse(res);
  }

  async function deleteRecording(recording_id: number): Promise<void> {
    await instance.delete(endpoints.delete, { params: { recording_id } });
  }

  async function addTag({
    recording_id,
    tag_id,
  }: {
    recording_id: number;
    tag_id: number;
  }): Promise<Recording> {
    const data = await instance.post(
      endpoints.addTag,
      {},
      {
        params: { tag_id, recording_id },
      },
    );
    return RecordingSchema.parse(data);
  }

  async function removeTag({
    recording_id,
    tag_id,
  }: {
    recording_id: number;
    tag_id: number;
  }): Promise<Recording> {
    const data = await instance.delete(endpoints.removeTag, {
      params: { recording_id, tag_id },
    });
    return RecordingSchema.parse(data);
  }

  async function addNote({
    recording_id,
    message,
    is_issue,
  }: {
    recording_id: number;
    message: string;
    is_issue: boolean;
  }): Promise<Recording> {
    const data = await instance.post(
      endpoints.addNote,
      { message, is_issue },
      { params: { recording_id } },
    );
    return RecordingSchema.parse(data);
  }

  async function removeNote({
    recording_id,
    note_id,
  }: {
    recording_id: number;
    note_id: number;
  }): Promise<Recording> {
    const data = await instance.delete(endpoints.removeNote, {
      params: { recording_id, note_id },
    });
    return RecordingSchema.parse(data);
  }

  async function addFeature({
    recording_id,
    feature_name_id,
    value,
  }: {
    recording_id: number;
    feature_name_id: number;
    value: number;
  }): Promise<Recording> {
    const data = await instance.post(
      endpoints.addFeature,
      { feature_name_id, value },
      { params: { recording_id } },
    );
    return RecordingSchema.parse(data);
  }

  async function removeFeature({
    recording_id,
    feature_name_id,
  }: {
    recording_id: number;
    feature_name_id: number;
  }): Promise<Recording> {
    const data = await instance.delete(endpoints.removeFeature, {
      params: { recording_id, feature_name_id },
    });
    return RecordingSchema.parse(data);
  }

  async function updateFeature({
    recording_id,
    feature_name_id,
    value,
  }: {
    recording_id: number;
    feature_name_id: number;
    value: number;
  }): Promise<Recording> {
    const data = await instance.patch(
      endpoints.updateFeature,
      { value },
      { params: { recording_id, feature_name_id } },
    );
    return RecordingSchema.parse(data);
  }

  async function getNotes(query: GetRecordingNotesQuery) {
    const params = GetRecordingNotesQuerySchema.parse(query);
    const { data } = await instance.get(endpoints.getNotes, { params });
    return RecordingNotePageSchema.parse(data);
  }

  async function getTags(query: GetRecordingTagsQuery) {
    const params = GetRecordingTagsQuerySchema.parse(query);
    const { data } = await instance.get(endpoints.getTags, { params });
    return RecordingTagPageSchema.parse(data);
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
    getNotes,
    getTags,
  };
}
