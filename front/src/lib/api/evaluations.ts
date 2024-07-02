import { AxiosInstance } from "axios";
import { z } from "zod";

import { GetManySchema, Page } from "@/lib/api/common";
import {
  EvaluationSchema,
  EvaluationSetSchema,
  ModelRunSchema,
  NumberFilterSchema,
  StringFilterSchema,
  UserRunSchema,
} from "@/schemas";

import type { Evaluation } from "@/types";

export const EvaluationCreateSchema = z.object({
  task: z.string(),
  score: z.number(),
});

export type EvaluationCreate = z.input<typeof EvaluationCreateSchema>;

export const EvaluationPageSchema = Page(EvaluationSchema);

export type EvaluationPage = z.infer<typeof EvaluationPageSchema>;

export const EvaluationFilterSchema = z.object({
  score: NumberFilterSchema.optional(),
  task: StringFilterSchema.optional(),
  model_run: ModelRunSchema.optional(),
  user_run: UserRunSchema.optional(),
  evaluation_set: EvaluationSetSchema.optional(),
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
    const response = await instance.get(endpoints.getMany, {
      params: {
        limit: params.limit,
        offset: params.offset,
        sort_by: params.sort_by,
        score__lt: params.score?.lt,
        score__gt: params.score?.gt,
        task__has: params.task?.has,
        task__eq: params.task?.eq,
        model_run__eq: params.model_run?.uuid,
        user_run__eq: params.user_run?.uuid,
        evaluation_set__eq: params.evaluation_set?.uuid,
      },
    });
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
