import { z } from "zod";
import { AxiosInstance } from "axios";

import {
  type Clip,
  type Tag,
  type Note,
  type ClipAnnotation,
  ClipAnnotationSchema,
} from "@/api/schemas";
import { type NoteCreate, NoteCreateSchema } from "@/api/notes";
import { GetManySchema, Page } from "@/api/common";

export const ClipAnnotationPageSchema = Page(ClipAnnotationSchema);

export type ClipAnnotationPage = z.infer<typeof ClipAnnotationPageSchema>;

export const ClipAnnotationFilterSchema = z.object({
  clip__eq: z.string().uuid().optional(),
  tag__key: z.string().optional(),
  tag__value: z.string().optional(),
  annotation_project__eq: z.string().uuid().optional(),
  evaluation_set__eq: z.string().uuid().optional(),
});

export type ClipAnnotationFilter = z.input<typeof ClipAnnotationFilterSchema>;

export const GetClipAnnotationsQuerySchema = z.intersection(
  GetManySchema,
  ClipAnnotationFilterSchema,
);

export type GetClipAnnotationsQuery = z.input<
  typeof GetClipAnnotationsQuerySchema
>;

const DEFAULT_ENDPOINTS = {
  getMany: "/api/v1/clip_annotations/",
  get: "/api/v1/clip_annotations/detail/",
  create: "/api/v1/clip_annotations/",
  delete: "/api/v1/clip_annotations/",
  addTag: "/api/v1/clip_annotations/detail/tags/",
  removeTag: "/api/v1/clip_annotations/detail/tags/",
  addNote: "/api/v1/clip_annotations/detail/notes/",
  removeNote: "/api/v1/clip_annotations/detail/notes/",
};

export function registerClipAnnotationsAPI(
  instance: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  async function create(clip: Clip): Promise<ClipAnnotation> {
    const response = await instance.post(
      endpoints.create,
      {},
      {
        params: { clip_uuid: clip.uuid },
      },
    );
    return ClipAnnotationSchema.parse(response.data);
  }

  async function getMany(
    query: GetClipAnnotationsQuery,
  ): Promise<ClipAnnotationPage> {
    const params = GetClipAnnotationsQuerySchema.parse(query);
    const response = await instance.get(endpoints.getMany, { params });
    return ClipAnnotationPageSchema.parse(response.data);
  }

  async function get(uuid: string): Promise<ClipAnnotation> {
    const response = await instance.get(endpoints.get, {
      params: { clip_annotation_uuid: uuid },
    });
    return ClipAnnotationSchema.parse(response.data);
  }

  async function deleteClipAnnotation(
    clipAnnotation: ClipAnnotation,
  ): Promise<ClipAnnotation> {
    const response = await instance.delete(endpoints.delete, {
      params: { clip_annotation_uuid: clipAnnotation.uuid },
    });
    return ClipAnnotationSchema.parse(response.data);
  }

  async function addTag(
    clipAnnotation: ClipAnnotation,
    tag: Tag,
  ): Promise<ClipAnnotation> {
    const respose = await instance.post(
      endpoints.addTag,
      {},
      {
        params: {
          clip_annotation_uuid: clipAnnotation.uuid,
          key: tag.key,
          value: tag.value,
        },
      },
    );
    return ClipAnnotationSchema.parse(respose.data);
  }

  async function removeTag(
    clipAnnotation: ClipAnnotation,
    tag: Tag,
  ): Promise<ClipAnnotation> {
    const respose = await instance.delete(endpoints.removeTag, {
      params: {
        clip_annotation_uuid: clipAnnotation.uuid,
        key: tag.key,
        value: tag.value,
      },
    });
    return ClipAnnotationSchema.parse(respose.data);
  }

  async function addNote(
    clipAnnotation: ClipAnnotation,
    data: NoteCreate,
  ): Promise<ClipAnnotation> {
    const body = NoteCreateSchema.parse(data);
    const response = await instance.post(endpoints.addNote, body, {
      params: {
        clip_annotation_uuid: clipAnnotation.uuid,
      },
    });
    return ClipAnnotationSchema.parse(response.data);
  }

  async function removeNote(
    clipAnnotation: ClipAnnotation,
    note: Note,
  ): Promise<ClipAnnotation> {
    const response = await instance.delete(endpoints.removeNote, {
      params: {
        clip_annotation_uuid: clipAnnotation.uuid,
        note_uuid: note.uuid,
      },
    });
    return ClipAnnotationSchema.parse(response.data);
  }

  return {
    create,
    getMany,
    get,
    delete: deleteClipAnnotation,
    addTag,
    removeTag,
    addNote,
    removeNote,
  } as const;
}
