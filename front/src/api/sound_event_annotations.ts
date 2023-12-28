import { AxiosInstance } from "axios";
import { z } from "zod";

import { GetManySchema, Page } from "@/api/common";
import { type NoteCreate, NoteCreateSchema } from "@/api/notes";
import {
  type ClipAnnotation,
  GeometrySchema,
  type Note,
  type SoundEventAnnotation,
  SoundEventAnnotationSchema,
  type Tag,
} from "@/api/schemas";

export const SoundEventAnnotationCreateSchema = z.object({
  geometry: GeometrySchema,
  tag_ids: z.array(z.number()).optional(),
});

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
  project__eq: z.number().optional(),
  recording__eq: z.number().optional(),
  sound_event__eq: z.number().optional(),
  created_by__eq: z.string().optional(),
  tag__eq: z.string().optional(),
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
    const response = await instance.get(endpoints.getMany, { params });
    return SoundEventAnnotationPageSchema.parse(response.data);
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

  return {
    create,
    getMany,
    get: getSoundEventAnnotation,
    update: updateSoundEventAnnotation,
    addTag,
    removeTag,
    addNote,
    removeNote,
    delete: deleteSoundEventAnnotation,
  } as const;
}
