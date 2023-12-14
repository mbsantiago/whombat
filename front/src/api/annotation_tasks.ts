import { z } from "zod";
import { AxiosInstance } from "axios";

import {
  type AnnotationTask,
  AnnotationTaskSchema,
  AnnotationStatus,
  ClipAnnotation,
  ClipAnnotationSchema,
} from "@/api/schemas";

import { GetManySchema, Page } from "./common";

export const AnnotationTaskCreateSchema = z.object({
  clip_id: z.number(),
  project_id: z.number(),
});

export type AnnotationTaskCreate = z.input<typeof AnnotationTaskCreateSchema>;

export const AnnotationTaskPageSchema = Page(AnnotationTaskSchema);

export type AnnotationTaskPage = z.infer<typeof AnnotationTaskPageSchema>;

export const AnnotationTaskFilterSchema = z.object({
  dataset__eq: z.string().uuid().optional(),
  annotation_project__eq: z.string().uuid().optional(),
  recording_tag__key: z.string().optional(),
  recording_tag__value: z.string().optional(),
  pending__eq: z.boolean().optional(),
  assigned__eq: z.boolean().optional(),
  verified__eq: z.boolean().optional(),
  rejected__eq: z.boolean().optional(),
  assigned_to__eq: z.string().uuid().optional(),
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
  createMany: "/api/v1/tasks/",
  getMany: "/api/v1/tasks/",
  get: "/api/v1/tasks/detail/",
  getAnnotations: "/api/v1/tasks/detail/annotations/",
  delete: "/api/v1/tasks/detail/",
  addBadge: "/api/v1/tasks/detail/badges/",
  removeBadge: "/api/v1/tasks/detail/badges/",
};

export function registerAnnotationTasksAPI(
  instance: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  async function createMany(
    data: AnnotationTaskCreate[],
  ): Promise<AnnotationTask[]> {
    const body = z.array(AnnotationTaskCreateSchema).parse(data);
    const response = await instance.post(endpoints.createMany, body);
    return z.array(AnnotationTaskSchema).parse(response.data);
  }

  async function getMany(
    query: GetAnnotationTasksQuery,
  ): Promise<AnnotationTaskPage> {
    const params = GetAnnotationTasksQuerySchema.parse(query);
    const response = await instance.get(endpoints.getMany, { params });
    return AnnotationTaskPageSchema.parse(response.data);
  }

  async function getAnnotationTask(uuid: number): Promise<AnnotationTask> {
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
