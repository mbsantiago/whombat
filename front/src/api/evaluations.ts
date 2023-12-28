import { AxiosInstance } from "axios";
import { z } from "zod";

import { GetManySchema, Page } from "@/api/common";
import { EvaluationSchema } from "@/schemas";

import type { Evaluation } from "@/types";

export const EvaluationCreateSchema = z.object({
  task: z.string(),
  score: z.number(),
});

export type EvaluationCreate = z.input<typeof EvaluationCreateSchema>;

export const EvaluationPageSchema = Page(EvaluationSchema);

export type EvaluationPage = z.infer<typeof EvaluationPageSchema>;

export const EvaluationFilterSchema = z.object({
  score__lt: z.number().optional(),
  score__gt: z.number().optional(),
  task__eq: z.string().optional(),
  task__has: z.string().optional(),
  model_run__eq: z.string().uuid().optional(),
  user_run__eq: z.string().uuid().optional(),
  evaluation_set__eq: z.string().uuid().optional(),
});

export type EvaluationFilter = z.input<typeof EvaluationFilterSchema>;

export const GetEvaluationsQuerySchema = z.intersection(
  GetManySchema,
  EvaluationFilterSchema,
);

export type GetEvaluationsQuery = z.input<typeof GetEvaluationsQuerySchema>;

const DEFAULT_ENDPOINTS = {
  getMany: "/api/v1/evaluations/",
  get: "/api/v1/evaluations/detail/",
  create: "/api/v1/evaluations/",
  delete: "/api/v1/evaluations/detail/",
};

export function registerEvaluationAPI(
  instance: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  async function getManyEvaluations(
    query: GetEvaluationsQuery,
  ): Promise<EvaluationPage> {
    const params = GetEvaluationsQuerySchema.parse(query);
    const response = await instance.get(endpoints.getMany, { params });
    return EvaluationPageSchema.parse(response.data);
  }

  async function getEvaluation(uuid: string): Promise<Evaluation> {
    const response = await instance.get(endpoints.get, {
      params: { evaluation_uuid: uuid },
    });
    return EvaluationSchema.parse(response.data);
  }

  async function createEvaluation(data: EvaluationCreate): Promise<Evaluation> {
    const body = EvaluationCreateSchema.parse(data);
    const response = await instance.post(endpoints.create, body);
    return EvaluationSchema.parse(response.data);
  }

  async function deleteEvaluation(evaluation: Evaluation): Promise<Evaluation> {
    const response = await instance.delete(endpoints.delete, {
      params: { evaluation_uuid: evaluation.uuid },
    });
    return EvaluationSchema.parse(response.data);
  }

  return {
    getMany: getManyEvaluations,
    get: getEvaluation,
    create: createEvaluation,
    delete: deleteEvaluation,
  } as const;
}
