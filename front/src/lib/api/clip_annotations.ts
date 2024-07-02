import { AxiosInstance } from "axios";
import { z } from "zod";

import { GetManySchema, Page } from "@/lib/api/common";
import { type NoteCreate, NoteCreateSchema } from "@/lib/api/notes";
import {
  AnnotationProjectSchema,
  ClipAnnotationSchema,
  ClipSchema,
  EvaluationSetSchema,
  TagSchema,
} from "@/schemas";

import type { Clip, ClipAnnotation, Note, Tag } from "@/lib/types";

export const ClipAnnotationPageSchema = Page(ClipAnnotationSchema);

export type ClipAnnotationPage = z.infer<typeof ClipAnnotationPageSchema>;

export const ClipAnnotationFilterSchema = z.object({
  clip: ClipSchema.optional(),
  tag: TagSchema.optional(),
  annotation_project: AnnotationProjectSchema.optional(),
  evaluation_set: EvaluationSetSchema.optional(),
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
    const response = await instance.get(endpoints.getMany, {
      params: {
        limit: params.limit,
        offset: params.offset,
        sort_by: params.sort_by,
        clip__eq: params.clip?.uuid,
        tag__key: params.tag?.key,
        tag__value: params.tag?.value,
        annotation_project__eq: params.annotation_project?.uuid,
        evaluation_set__eq: params.evaluation_set?.uuid,
      },
    });
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
