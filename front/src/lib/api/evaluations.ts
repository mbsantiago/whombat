import { AxiosInstance } from "axios";

import { GetMany, Page } from "@/lib/api/common";
import * as schemas from "@/lib/schemas";
import type * as types from "@/lib/types";

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
    query: types.GetMany & types.EvaluationFilter,
  ): Promise<types.Page<types.Evaluation>> {
    const params = GetMany(schemas.EvaluationFilterSchema).parse(query);
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
    return Page(schemas.EvaluationSchema).parse(response.data);
  }

  async function getEvaluation(uuid: string): Promise<types.Evaluation> {
    const response = await instance.get(endpoints.get, {
      params: { evaluation_uuid: uuid },
    });
    return schemas.EvaluationSchema.parse(response.data);
  }

  async function createEvaluation(
    data: types.EvaluationCreate,
  ): Promise<types.Evaluation> {
    const body = schemas.EvaluationCreateSchema.parse(data);
    const response = await instance.post(endpoints.create, body);
    return schemas.EvaluationSchema.parse(response.data);
  }

  async function deleteEvaluation(
    evaluation: types.Evaluation,
  ): Promise<types.Evaluation> {
    const response = await instance.delete(endpoints.delete, {
      params: { evaluation_uuid: evaluation.uuid },
    });
    return schemas.EvaluationSchema.parse(response.data);
  }

  return {
    getMany: getManyEvaluations,
    get: getEvaluation,
    create: createEvaluation,
    delete: deleteEvaluation,
  } as const;
}
