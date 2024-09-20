import { AxiosInstance } from "axios";
import { z } from "zod";

import { GetManySchema, Page } from "@/lib/api/common";
import { type NoteCreate, NoteCreateSchema } from "@/lib/api/notes";
import {
  AnnotationProjectSchema,
  GeometrySchema,
  RecordingSchema,
  SoundEventAnnotationSchema,
  SoundEventSchema,
  TagSchema,
  UserSchema,
  FeatureSchema,
} from "@/lib/schemas";

import type {
  ClipAnnotation,
  Note,
  SoundEventAnnotation,
  Tag,
} from "@/lib/types";

export const SoundEventAnnotationCreateSchema = z.object({
  geometry: GeometrySchema,
  tags: z.array(TagSchema).optional(),
});

export const ScatterPlotDataSchema = z.object({
  uuid: z.string(),
  features: z.array(FeatureSchema).optional(),
  tags: z.array(TagSchema).optional(),
  recording_tags: z.array(TagSchema).optional(),
});

export const ScatterPlotDataPageSchema = Page(ScatterPlotDataSchema);

export type ScatterPlotData = z.infer<typeof ScatterPlotDataSchema>;

export type ScatterPlotDataPage = z.infer<typeof ScatterPlotDataPageSchema>;

export type SoundEventAnnotationCreate = z.input<
  typeof SoundEventAnnotationCreateSchema
>;

export const SoundEventAnnotationUpdateSchema = z.object({
  geometry: GeometrySchema,
});

export type SoundEventAnnotationUpdate = z.input<
  typeof SoundEventAnnotationUpdateSchema
>;

export const SoundEventAnnotationPageSchema = Page(SoundEventAnnotationSchema);

export type SoundEventAnnotationPage = z.infer<
  typeof SoundEventAnnotationPageSchema
>;

export const SoundEventAnnotationFilterSchema = z.object({
  annotation_project: AnnotationProjectSchema.optional(),
  recording: RecordingSchema.optional(),
  sound_event: SoundEventSchema.optional(),
  created_by: UserSchema.optional(),
  tag: TagSchema.optional(),
});

export type SoundEventAnnotationFilter = z.input<
  typeof SoundEventAnnotationFilterSchema
>;

export const GetAnnotationsQuerySchema = z.intersection(
  GetManySchema,
  SoundEventAnnotationFilterSchema,
);

export type GetAnnotationsQuerySchema = z.input<
  typeof GetAnnotationsQuerySchema
>;

const DEFAULT_ENDPOINTS = {
  create: "/api/v1/sound_event_annotations/",
  getMany: "/api/v1/sound_event_annotations/",
  get: "/api/v1/sound_event_annotations/detail/",
  getTags: "/api/v1/sound_event_annotations/tags/",
  getScatterPlotData: "/api/v1/sound_event_annotations/scatter_plot/",
  update: "/api/v1/sound_event_annotations/detail/",
  delete: "/api/v1/sound_event_annotations/detail/",
  addTag: "/api/v1/sound_event_annotations/detail/tags/",
  removeTag: "/api/v1/sound_event_annotations/detail/tags/",
  addNote: "/api/v1/sound_event_annotations/detail/notes/",
  removeNote: "/api/v1/sound_event_annotations/detail/notes/",
};

export function registerSoundEventAnnotationsAPI(
  instance: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  async function create(
    clipAnnotation: ClipAnnotation,
    data: SoundEventAnnotationCreate,
  ): Promise<SoundEventAnnotation> {
    const body = SoundEventAnnotationCreateSchema.parse(data);
    const response = await instance.post(endpoints.create, body, {
      params: { clip_annotation_uuid: clipAnnotation.uuid },
    });
    return SoundEventAnnotationSchema.parse(response.data);
  }

  async function getMany(
    query: GetAnnotationsQuerySchema,
  ): Promise<SoundEventAnnotationPage> {
    const params = GetAnnotationsQuerySchema.parse(query);
    const response = await instance.get(endpoints.getMany, {
      params: {
        limit: params.limit,
        offset: params.offset,
        sort_by: params.sort_by,
        annotation_project__eq: params.annotation_project?.uuid,
        recording__eq: params.recording?.uuid,
        sound_event__eq: params.sound_event?.uuid,
        created_by__eq: params.created_by?.id,
        tag__key: params.tag?.key,
        tag__value: params.tag?.value,
      },
    });
    return SoundEventAnnotationPageSchema.parse(response.data);
  }

  async function getScatterPlotData(
    query: GetAnnotationsQuerySchema,
  ): Promise<ScatterPlotDataPage> {
    const params = GetAnnotationsQuerySchema.parse(query);
    const response = await instance.get(endpoints.getScatterPlotData, {
      params: {
        limit: params.limit,
        offset: params.offset,
        sort_by: params.sort_by,
        annotation_project__eq: params.annotation_project?.uuid,
        recording__eq: params.recording?.uuid,
        sound_event__eq: params.sound_event?.uuid,
        created_by__eq: params.created_by?.id,
        tag__key: params.tag?.key,
        tag__value: params.tag?.value,
      },
    });
    return ScatterPlotDataPageSchema.parse(response.data);
  }

  async function getSoundEventAnnotation(
    uuid: string,
  ): Promise<SoundEventAnnotation> {
    const response = await instance.get(endpoints.get, {
      params: { sound_event_annotation_uuid: uuid },
    });
    return SoundEventAnnotationSchema.parse(response.data);
  }

  async function updateSoundEventAnnotation(
    soundEventAnnotation: SoundEventAnnotation,
    data: SoundEventAnnotationUpdate,
  ): Promise<SoundEventAnnotation> {
    const body = SoundEventAnnotationUpdateSchema.parse(data);
    const response = await instance.patch(endpoints.update, body, {
      params: {
        sound_event_annotation_uuid: soundEventAnnotation.uuid,
      },
    });
    return SoundEventAnnotationSchema.parse(response.data);
  }

  async function deleteSoundEventAnnotation(
    soundEventAnnotation: SoundEventAnnotation,
  ): Promise<SoundEventAnnotation> {
    const response = await instance.delete(endpoints.delete, {
      params: {
        sound_event_annotation_uuid: soundEventAnnotation.uuid,
      },
    });
    return SoundEventAnnotationSchema.parse(response.data);
  }

  async function addTag(
    soundEventAnnotation: SoundEventAnnotation,
    tag: Tag,
  ): Promise<SoundEventAnnotation> {
    const response = await instance.post(
      endpoints.addTag,
      {},
      {
        params: {
          sound_event_annotation_uuid: soundEventAnnotation.uuid,
          key: tag.key,
          value: tag.value,
        },
      },
    );
    return SoundEventAnnotationSchema.parse(response.data);
  }

  async function removeTag(
    soundEventAnnotation: SoundEventAnnotation,
    tag: Tag,
  ): Promise<SoundEventAnnotation> {
    const response = await instance.delete(endpoints.removeTag, {
      params: {
        sound_event_annotation_uuid: soundEventAnnotation.uuid,
        key: tag.key,
        value: tag.value,
      },
    });
    return SoundEventAnnotationSchema.parse(response.data);
  }

  async function addNote(
    soundEventAnnotation: SoundEventAnnotation,
    data: NoteCreate,
  ): Promise<SoundEventAnnotation> {
    const body = NoteCreateSchema.parse(data);
    const response = await instance.post(endpoints.addNote, body, {
      params: {
        sound_event_annotation_uuid: soundEventAnnotation.uuid,
      },
    });
    return SoundEventAnnotationSchema.parse(response.data);
  }

  async function removeNote(
    soundEventAnnotation: SoundEventAnnotation,
    note: Note,
  ): Promise<SoundEventAnnotation> {
    const response = await instance.delete(endpoints.removeNote, {
      params: {
        sound_event_annotation_uuid: soundEventAnnotation.uuid,
        note_uuid: note.uuid,
      },
    });
    return SoundEventAnnotationSchema.parse(response.data);
  }

  async function getTags(
    query: GetAnnotationsQuerySchema,
  ): Promise<SoundEventAnnotationTagPage> {
    const params = GetAnnotationsQuerySchema.parse(query);
    const response = await instance.get(endpoints.getTags, {
      params: {
        limit: params.limit,
        offset: params.offset,
        sort_by: params.sort_by,
        annotation_project__eq: params.annotation_project?.uuid,
        recording__eq: params.recording?.uuid,
        sound_event__eq: params.sound_event?.uuid,
        created_by__eq: params.created_by?.id,
        tag__key: params.tag?.key,
        tag__value: params.tag?.value,
      },
    });
    return SoundEventAnnotationTagPageSchema.parse(response.data);
  }

  return {
    create,
    getMany,
    getTags,
    get: getSoundEventAnnotation,
    update: updateSoundEventAnnotation,
    addTag,
    removeTag,
    addNote,
    removeNote,
    getScatterPlotData,
    delete: deleteSoundEventAnnotation,
  } as const;
}

export const SoundEventAnnotationTagSchema = z.object({
  sound_event_annotation_uuid: z.string().uuid(),
  tag: TagSchema,
});

export type SoundEventAnnotationTag = z.infer<
  typeof SoundEventAnnotationTagSchema
>;

export const SoundEventAnnotationTagPageSchema = Page(
  SoundEventAnnotationTagSchema,
);

export type SoundEventAnnotationTagPage = z.infer<
  typeof SoundEventAnnotationTagPageSchema
>;
