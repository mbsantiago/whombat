import { AxiosInstance } from "axios";
import { z } from "zod";

import { GetManySchema, Page } from "@/lib/api/common";
import {
  EvaluationSetSchema,
  ModelRunSchema,
  NumberFilterSchema,
  StringFilterSchema,
  EvaluationSchema,
} from "@/schemas";

import type { ModelRun, Evaluation, EvaluationSet } from "@/types";

export const ModelRunFilterSchema = z.object({
  search: z.string().optional(),
  name: StringFilterSchema.optional(),
  version: z.string().optional(),
  evaluated: z.boolean().optional(),
  score: NumberFilterSchema.optional(),
  evaluation_set: EvaluationSetSchema.optional(),
  has_evaluation: z.boolean().optional(),
});

export type ModelRunFilter = z.input<typeof ModelRunFilterSchema>;

export const GetModelRunQuerySchema = z.intersection(
  GetManySchema,
  ModelRunFilterSchema,
);

export type GetModelRunQuery = z.input<typeof GetModelRunQuerySchema>;

export const ModelRunPageSchema = Page(ModelRunSchema);

export type ModelRunPage = z.infer<typeof ModelRunPageSchema>;

export const ModelRunUpdateSchema = z.object({
  name: z.string().optional(),
  version: z.string().optional(),
  description: z.string().optional(),
});

export type ModelRunUpdate = z.input<typeof ModelRunUpdateSchema>;

const DEFAULT_ENDPOINTS = {
  getMany: "/api/v1/model_runs/",
  get: "/api/v1/model_runs/detail/",
  update: "/api/v1/model_runs/detail/",
  delete: "/api/v1/model_runs/detail/",
  import: "/api/v1/model_runs/import/",
  evaluate: "/api/v1/model_runs/detail/evaluate/",
};

export function registerModelRunAPI(
  instance: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  async function getManyModelRuns(
    query: GetModelRunQuery,
  ): Promise<ModelRunPage> {
    const params = GetModelRunQuerySchema.parse(query);
    const response = await instance.get(endpoints.getMany, {
      params: {
        limit: params.limit,
        offset: params.offset,
        sort_by: params.sort_by,
        search: params.search,
        name__has: params.name?.has,
        name__eq: params.name?.eq,
        version__eq: params.version,
        evaluated__eq: params.evaluated,
        score__lt: params.score?.lt,
        score__gt: params.score?.gt,
        evaluation_set__eq: params.evaluation_set?.uuid,
        has_evaluation__eq: params.has_evaluation,
      },
    });
    return ModelRunPageSchema.parse(response.data);
  }

  async function getModelRun(uuid: string): Promise<ModelRun> {
    const response = await instance.get(endpoints.get, {
      params: { model_run_uuid: uuid },
    });
    return ModelRunSchema.parse(response.data);
  }

  async function updateModelRun(
    modelRun: ModelRun,
    data: ModelRunUpdate,
  ): Promise<ModelRun> {
    const body = ModelRunUpdateSchema.parse(data);
    const response = await instance.patch(endpoints.update, body, {
      params: { model_run_uuid: modelRun.uuid },
    });
    return ModelRunSchema.parse(response.data);
  }

  async function deleteModelRun(modelRun: ModelRun): Promise<ModelRun> {
    const response = await instance.delete(endpoints.delete, {
      params: { model_run_uuid: modelRun.uuid },
    });
    return ModelRunSchema.parse(response.data);
  }

  async function importModelRun(data: FormData): Promise<ModelRun> {
    const { data: res } = await instance.post(endpoints.import, data);
    return ModelRunSchema.parse(res);
  }

  async function evaluateModelRun(
    modelRun: ModelRun,
    evaluationSet: EvaluationSet,
  ): Promise<Evaluation> {
    const { data: res } = await instance.post(
      endpoints.evaluate,
      {},
      {
        params: {
          model_run_uuid: modelRun.uuid,
          evaluation_set_uuid: evaluationSet.uuid,
        },
      },
    );
    return EvaluationSchema.parse(res);
  }

  return {
    getMany: getManyModelRuns,
    get: getModelRun,
    update: updateModelRun,
    evaluate: evaluateModelRun,
    delete: deleteModelRun,
    import: importModelRun,
  } as const;
}
