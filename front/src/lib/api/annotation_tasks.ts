import { AxiosInstance } from "axios";
import { z } from "zod";

import { GetMany, Page } from "@/lib/api/common";
import * as schemas from "@/lib/schemas";
import type * as types from "@/lib/types";

const DEFAULT_ENDPOINTS = {
  createMany: "/api/v1/annotation_tasks/",
  getMany: "/api/v1/annotation_tasks/",
  get: "/api/v1/annotation_tasks/detail/",
  getAnnotations: "/api/v1/annotation_tasks/detail/clip_annotation/",
  delete: "/api/v1/annotation_tasks/detail/",
  addBadge: "/api/v1/annotation_tasks/detail/badges/",
  removeBadge: "/api/v1/annotation_tasks/detail/badges/",
};

export function registerAnnotationTasksAPI(
  instance: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  async function createMany(
    annotationProject: types.AnnotationProject,
    clips: types.Clip[],
  ): Promise<types.AnnotationTask[]> {
    const response = await instance.post(
      endpoints.createMany,
      clips.map((clip) => clip.uuid),
      {
        params: {
          annotation_project_uuid: annotationProject.uuid,
        },
      },
    );
    return z.array(schemas.AnnotationTaskSchema).parse(response.data);
  }

  async function getMany(
    query: types.GetMany & types.AnnotationTaskFilter,
  ): Promise<types.Page<types.AnnotationTask>> {
    const params = GetMany(schemas.AnnotationTaskFilterSchema).parse(query);
    const response = await instance.get(endpoints.getMany, {
      params: {
        limit: params.limit,
        offset: params.offset,
        sort_by: params.sort_by,
        dataset__eq: params.dataset?.uuid,
        annotation_project__eq: params.annotation_project?.uuid,
        recording_tag__key: params.recording_tag?.key,
        recording_tag__value: params.recording_tag?.value,
        sound_event_annotation_tag__key: params.sound_event_annotation_tag?.key,
        sound_event_annotation_tag__value:
          params.sound_event_annotation_tag?.value,
        pending__eq: params.pending,
        assigned__eq: params.assigned,
        verified__eq: params.verified,
        rejected__eq: params.rejected,
        completed__eq: params.completed,
        assigned_to__eq: params.assigned_to?.id,
        search_recordings: params.search_recordings,
      },
    });
    return Page(schemas.AnnotationTaskSchema).parse(response.data);
  }

  async function getAnnotationTask(
    uuid: string,
  ): Promise<types.AnnotationTask> {
    const response = await instance.get(endpoints.get, {
      params: { annotation_task_uuid: uuid },
    });
    return schemas.AnnotationTaskSchema.parse(response.data);
  }

  async function getTaskAnnotations(
    annotationTask: types.AnnotationTask,
  ): Promise<types.ClipAnnotation> {
    const response = await instance.get(endpoints.getAnnotations, {
      params: {
        annotation_task_uuid: annotationTask.uuid,
      },
    });
    return schemas.ClipAnnotationSchema.parse(response.data);
  }

  async function deleteAnnotationTask(
    annotationTask: types.AnnotationTask,
  ): Promise<types.AnnotationTask> {
    const response = await instance.delete(endpoints.delete, {
      params: {
        annotation_task_uuid: annotationTask.uuid,
      },
    });
    return schemas.AnnotationTaskSchema.parse(response.data);
  }

  async function addBadge(
    annotationTask: types.AnnotationTask,
    state: types.AnnotationStatus,
  ): Promise<types.AnnotationTask> {
    const response = await instance.post(
      endpoints.addBadge,
      {},
      {
        params: {
          annotation_task_uuid: annotationTask.uuid,
          state,
        },
      },
    );
    return schemas.AnnotationTaskSchema.parse(response.data);
  }

  async function removeBadge(
    annotationTask: types.AnnotationTask,
    state: types.AnnotationStatus,
  ): Promise<types.AnnotationTask> {
    const response = await instance.delete(endpoints.removeBadge, {
      params: {
        annotation_task_uuid: annotationTask.uuid,
        state,
      },
    });
    return schemas.AnnotationTaskSchema.parse(response.data);
  }

  return {
    createMany,
    getMany,
    get: getAnnotationTask,
    getAnnotations: getTaskAnnotations,
    delete: deleteAnnotationTask,
    addBadge,
    removeBadge,
  } as const;
}
