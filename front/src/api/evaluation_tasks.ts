import { z } from "zod";
import { AxiosInstance } from "axios";

import { GetManySchema, Page } from "@/api/common";
import { TaskSchema } from "@/api/tasks";

const DEFAULT_ENDPOINTS = {
  getMany: "/api/v1/evaluation_tasks/",
  createMany: "/api/v1/evaluation_tasks/",
  get: "/api/v1/evaluation_task/detail/",
  delete: "/api/v1/evaluation_task/detail/",
};

export const EvaluationTaskFilterSchema = z.object({
  evaluation_set__eq: z.number().optional(),
});

export type EvaluationTaskFilter = z.infer<typeof EvaluationTaskFilterSchema>;

export const EvaluationTaskCreateSchema = z.object({
  evaluation_set_id: z.number(),
  task_id: z.number(),
});

export type EvaluationTaskCreate = z.infer<typeof EvaluationTaskCreateSchema>;

export const EvaluationTaskSchema = EvaluationTaskCreateSchema.extend({
  id: z.number(),
  task: TaskSchema,
});

export type EvaluationTask = z.infer<typeof EvaluationTaskSchema>;

export const EvaluationTaskPageSchema = Page(EvaluationTaskSchema);

export type EvaluationTaskPage = z.infer<typeof EvaluationTaskPageSchema>;

export const EvaluationTaskGetManySchema = z.intersection(
  GetManySchema,
  EvaluationTaskFilterSchema,
);

export type EvaluationTaskGetMany = z.infer<typeof EvaluationTaskGetManySchema>;

export function registerEvaluationTaskAPI(
  instance: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  return {
    getMany: async (params: EvaluationTaskGetMany) => {
      const response = await instance.get(endpoints.getMany, { params });
      return EvaluationTaskPageSchema.parse(response.data);
    },
    createMany: async (data: EvaluationTaskCreate[]) => {
      const response = await instance.post(endpoints.createMany, data);
      return z.array(EvaluationTaskSchema).parse(response.data);
    },
    get: async (evaluation_task_id: number) => {
      const response = await instance.get(endpoints.get, {
        params: { evaluation_task_id },
      });
      return EvaluationTaskSchema.parse(response.data);
    },
    delete: async (evaluation_task_id: number) => {
      const response = await instance.delete(endpoints.delete, {
        params: { evaluation_task_id },
      });
      return EvaluationTaskSchema.parse(response.data);
    },
  };
}
