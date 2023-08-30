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
};

// TODO: Add more filters
const RecordingFilterSchema = z.object({
  search: z.string().optional(),
  dataset: z.number().int().optional(),
});

type RecordingFilter = z.infer<typeof RecordingFilterSchema>;

const RecordingSchema = z.object({
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

type Recording = z.infer<typeof RecordingSchema>;

const RecordingPageSchema = Page(RecordingSchema);

const UpdateRecordingSchema = z.object({
  date: z.coerce.date().nullable().optional(),
  time: z
    .string()
    .regex(/^\d{2}:\d{2}:\d{2}(\.\d+)?$/)
    .nullable()
    .optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
});

type UpdateRecording = z.infer<typeof UpdateRecordingSchema>;

const GetRecordingsQuerySchema = z.intersection(
  GetManySchema,
  RecordingFilterSchema,
);

function registerRecordingAPI(
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

  async function get(uuid: string): Promise<z.infer<typeof RecordingSchema>> {
    const { data } = await instance.get(endpoints.get, { params: { uuid } });
    return RecordingSchema.parse(data);
  }

  async function update(
    recording_id: number,
    data: z.infer<typeof UpdateRecordingSchema>,
  ): Promise<z.infer<typeof RecordingSchema>> {
    const body = UpdateRecordingSchema.parse(data);
    const { data: res } = await instance.patch(endpoints.update, body, {
      params: { recording_id },
    });
    return RecordingSchema.parse(res);
  }

  async function deleteRecording(uuid: string): Promise<void> {
    await instance.delete(endpoints.delete, { params: { uuid } });
  }

  async function addTag({
    uuid,
    tag_id,
  }: {
    uuid: string;
    tag_id: number;
  }): Promise<void> {
    await instance.post(endpoints.addTag, { tag_id }, { params: { uuid } });
  }

  async function removeTag({
    uuid,
    tag_id,
  }: {
    uuid: string;
    tag_id: number;
  }): Promise<void> {
    await instance.delete(endpoints.removeTag, { params: { uuid, tag_id } });
  }

  async function addNote({
    uuid,
    message,
    is_issue,
  }: {
    uuid: string;
    message: string;
    is_issue: boolean;
  }): Promise<void> {
    await instance.post(
      endpoints.addNote,
      { message, is_issue },
      { params: { uuid } },
    );
  }

  async function removeNote({
    uuid,
    note_id,
  }: {
    uuid: string;
    note_id: number;
  }): Promise<void> {
    await instance.delete(endpoints.removeNote, { params: { uuid, note_id } });
  }

  async function addFeature({
    uuid,
    feature_name_id,
    value,
  }: {
    uuid: string;
    feature_name_id: number;
    value: number;
  }): Promise<void> {
    await instance.post(
      endpoints.addFeature,
      { feature_name_id, value },
      { params: { uuid } },
    );
  }

  async function removeFeature({
    uuid,
    feature_name_id,
  }: {
    uuid: string;
    feature_name_id: number;
  }): Promise<void> {
    await instance.delete(endpoints.removeFeature, {
      params: { uuid, feature_name_id },
    });
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
  };
}

export {
  registerRecordingAPI,
  RecordingSchema,
  RecordingFilterSchema,
  UpdateRecordingSchema,
  type RecordingFilter,
  type Recording,
  type UpdateRecording,
};
