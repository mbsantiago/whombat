import { AxiosInstance } from "axios";

import { GetMany, Page } from "@/lib/api/common";
import * as schemas from "@/lib/schemas";
import type * as types from "@/lib/types";

const DEFAULT_ENDPOINTS = {
  getMany: "/api/v1/model_runs/",
  get: "/api/v1/model_runs/detail/",
  getEvaluation: "/api/v1/model_runs/detail/evaluation/",
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
    query: types.GetMany & types.ModelRunFilter,
  ): Promise<types.Page<types.ModelRun>> {
    const params = GetMany(schemas.ModelRunFilterSchema).parse(query);
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
    return Page(schemas.ModelRunSchema).parse(response.data);
  }

  async function getModelRun(uuid: string): Promise<types.ModelRun> {
    const response = await instance.get(endpoints.get, {
      params: { model_run_uuid: uuid },
    });
    return schemas.ModelRunSchema.parse(response.data);
  }

  async function getEvaluation(
    modelRun: types.ModelRun,
    evaluationSet: types.EvaluationSet,
  ): Promise<types.Evaluation> {
    const response = await instance.get(endpoints.getEvaluation, {
      params: {
        model_run_uuid: modelRun.uuid,
        evaluation_set_uuid: evaluationSet.uuid,
      },
    });
    return schemas.EvaluationSchema.parse(response.data);
  }

  async function updateModelRun(
    modelRun: types.ModelRun,
    data: types.ModelRunUpdate,
  ): Promise<types.ModelRun> {
    const body = schemas.ModelRunUpdateSchema.parse(data);
    const response = await instance.patch(endpoints.update, body, {
      params: { model_run_uuid: modelRun.uuid },
    });
    return schemas.ModelRunSchema.parse(response.data);
  }

  async function deleteModelRun(
    modelRun: types.ModelRun,
  ): Promise<types.ModelRun> {
    const response = await instance.delete(endpoints.delete, {
      params: { model_run_uuid: modelRun.uuid },
    });
    return schemas.ModelRunSchema.parse(response.data);
  }

  async function importModelRun(
    data: types.ModelRunImport,
  ): Promise<types.ModelRun> {
    const formData = new FormData();
    const file = data.model_run[0];
    formData.append("model_run", file);
    formData.append("evaluation_set_uuid", data.evaluation_set_uuid);
    const { data: res } = await instance.post(endpoints.import, formData);
    return schemas.ModelRunSchema.parse(res);
  }

  async function evaluateModelRun(
    modelRun: types.ModelRun,
    evaluationSet: types.EvaluationSet,
  ): Promise<types.Evaluation> {
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
    return schemas.EvaluationSchema.parse(res);
  }

  return {
    getMany: getManyModelRuns,
    get: getModelRun,
    getEvaluation,
    update: updateModelRun,
    evaluate: evaluateModelRun,
    delete: deleteModelRun,
    import: importModelRun,
  } as const;
}
