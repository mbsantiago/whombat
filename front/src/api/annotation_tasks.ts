import { AxiosInstance } from "axios";
import { z } from "zod";

import { GetManySchema, Page } from "@/api/common";
import {
  AnnotationProjectSchema,
  AnnotationTaskSchema,
  ClipAnnotationSchema,
  DatasetSchema,
  TagSchema,
  UserSchema,
} from "@/schemas";

import type {
  AnnotationProject,
  AnnotationStatus,
  AnnotationTask,
  Clip,
  ClipAnnotation,
} from "@/types";

export const AnnotationTaskPageSchema = Page(AnnotationTaskSchema);

export type AnnotationTaskPage = z.infer<typeof AnnotationTaskPageSchema>;

export const AnnotationTaskFilterSchema = z.object({
  dataset: DatasetSchema.optional(),
  annotation_project: AnnotationProjectSchema.optional(),
  recording_tag: TagSchema.optional(),
  sound_event_annotation_tag: TagSchema.optional(),
  pending: z.boolean().optional(),
  assigned: z.boolean().optional(),
  verified: z.boolean().optional(),
  rejected: z.boolean().optional(),
  assigned_to: UserSchema.optional(),
});

export type AnnotationTaskFilter = z.input<typeof AnnotationTaskFilterSchema>;

export const GetAnnotationTasksQuerySchema = z.intersection(
  GetManySchema,
  AnnotationTaskFilterSchema,
);

export type GetAnnotationTasksQuery = z.input<
  typeof GetAnnotationTasksQuerySchema
>;

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
    annotationProject: AnnotationProject,
    clips: Clip[],
  ): Promise<AnnotationTask[]> {
    const response = await instance.post(
      endpoints.createMany,
      clips.map((clip) => clip.uuid),
      {
        params: {
          annotation_project_uuid: annotationProject.uuid,
        },
      },
    );
    return z.array(AnnotationTaskSchema).parse(response.data);
  }

  async function getMany(
    query: GetAnnotationTasksQuery,
  ): Promise<AnnotationTaskPage> {
    const params = GetAnnotationTasksQuerySchema.parse(query);
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
        sound_event_annotation_tag__value: params.sound_event_annotation_tag?.value,
        pending__eq: params.pending,
        assigned__eq: params.assigned,
        verified__eq: params.verified,
        rejected__eq: params.rejected,
        assigned_to__eq: params.assigned_to?.id,
      },
    });
    return AnnotationTaskPageSchema.parse(response.data);
  }

  async function getAnnotationTask(uuid: string): Promise<AnnotationTask> {
    const response = await instance.get(endpoints.get, {
      params: { annotation_task_uuid: uuid },
    });
    return AnnotationTaskSchema.parse(response.data);
  }

  async function getTaskAnnotations(
    annotationTask: AnnotationTask,
  ): Promise<ClipAnnotation> {
    const response = await instance.get(endpoints.getAnnotations, {
      params: {
        annotation_task_uuid: annotationTask.uuid,
      },
    });
    return ClipAnnotationSchema.parse(response.data);
  }

  async function deleteAnnotationTask(
    annotationTask: AnnotationTask,
  ): Promise<AnnotationTask> {
    const response = await instance.delete(endpoints.delete, {
      params: {
        annotation_task_uuid: annotationTask.uuid,
      },
    });
    return AnnotationTaskSchema.parse(response.data);
  }

  async function addBadge(
    annotationTask: AnnotationTask,
    state: AnnotationStatus,
  ): Promise<AnnotationTask> {
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
    return AnnotationTaskSchema.parse(response.data);
  }

  async function removeBadge(
    annotationTask: AnnotationTask,
    state: AnnotationStatus,
  ): Promise<AnnotationTask> {
    const response = await instance.delete(endpoints.removeBadge, {
      params: {
        annotation_task_uuid: annotationTask.uuid,
        state,
      },
    });
    return AnnotationTaskSchema.parse(response.data);
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
