import { AxiosInstance } from "axios";

import { GetMany, Page } from "@/lib/api/common";
import * as schemas from "@/lib/schemas";
import * as types from "@/lib/types";

const DEFAULT_ENDPOINTS = {
  getMany: "/api/v1/clip_annotations/",
  get: "/api/v1/clip_annotations/detail/",
  getAnnotationTask: "/api/v1/clip_annotations/detail/annotation_task/",
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
  async function create(clip: types.Clip): Promise<types.ClipAnnotation> {
    const response = await instance.post(
      endpoints.create,
      {},
      {
        params: { clip_uuid: clip.uuid },
      },
    );
    return schemas.ClipAnnotationSchema.parse(response.data);
  }

  async function getMany(
    query: types.GetMany & types.ClipAnnotationFilter,
  ): Promise<types.Page<types.ClipAnnotation>> {
    const params = GetMany(schemas.ClipAnnotationFilterSchema).parse(query);
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
    return Page(schemas.ClipAnnotationSchema).parse(response.data);
  }

  async function get(uuid: string): Promise<types.ClipAnnotation> {
    const response = await instance.get(endpoints.get, {
      params: { clip_annotation_uuid: uuid },
    });
    return schemas.ClipAnnotationSchema.parse(response.data);
  }

  async function getAnnotationTask(
    uuid: string,
  ): Promise<types.AnnotationTask> {
    const response = await instance.get(endpoints.getAnnotationTask, {
      params: { clip_annotation_uuid: uuid },
    });
    return schemas.AnnotationTaskSchema.parse(response.data);
  }

  async function deleteClipAnnotation(
    clipAnnotation: types.ClipAnnotation,
  ): Promise<types.ClipAnnotation> {
    const response = await instance.delete(endpoints.delete, {
      params: { clip_annotation_uuid: clipAnnotation.uuid },
    });
    return schemas.ClipAnnotationSchema.parse(response.data);
  }

  async function addTag(
    clipAnnotation: types.ClipAnnotation,
    tag: types.Tag,
  ): Promise<types.ClipAnnotation> {
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
    return schemas.ClipAnnotationSchema.parse(respose.data);
  }

  async function removeTag(
    clipAnnotation: types.ClipAnnotation,
    tag: types.Tag,
  ): Promise<types.ClipAnnotation> {
    const respose = await instance.delete(endpoints.removeTag, {
      params: {
        clip_annotation_uuid: clipAnnotation.uuid,
        key: tag.key,
        value: tag.value,
      },
    });
    return schemas.ClipAnnotationSchema.parse(respose.data);
  }

  async function addNote(
    clipAnnotation: types.ClipAnnotation,
    data: types.NoteCreate,
  ): Promise<types.ClipAnnotation> {
    const body = schemas.NoteCreateSchema.parse(data);
    const response = await instance.post(endpoints.addNote, body, {
      params: {
        clip_annotation_uuid: clipAnnotation.uuid,
      },
    });
    return schemas.ClipAnnotationSchema.parse(response.data);
  }

  async function removeNote(
    clipAnnotation: types.ClipAnnotation,
    note: types.Note,
  ): Promise<types.ClipAnnotation> {
    const response = await instance.delete(endpoints.removeNote, {
      params: {
        clip_annotation_uuid: clipAnnotation.uuid,
        note_uuid: note.uuid,
      },
    });
    return schemas.ClipAnnotationSchema.parse(response.data);
  }

  return {
    create,
    getMany,
    get,
    getAnnotationTask,
    delete: deleteClipAnnotation,
    addTag,
    removeTag,
    addNote,
    removeNote,
  } as const;
}
