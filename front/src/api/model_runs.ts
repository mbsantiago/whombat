import { z } from "zod";
import { AxiosInstance } from "axios";

import { ModelRunSchema, type ModelRun } from "@/api/schemas";
import { GetManySchema, Page } from "@/api/common";

export const ModelRunFilterSchema = z.object({
  name__eq: z.string().optional(),
  name__has: z.string().optional(),
  version__eq: z.string().optional(),
  evaluated__eq: z.boolean().optional(),
  score__lt: z.number().optional(),
  score__gt: z.number().optional(),
  evaluation_set__eq: z.string().uuid().optional(),
  has_evaluation__eq: z.boolean().optional(),
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
  name: z.string(),
  version: z.string(),
  description: z.string().optional(),
});

export type ModelRunUpdate = z.input<typeof ModelRunUpdateSchema>;

const DEFAULT_ENDPOINTS = {
  getMany: "/api/v1/model_runs/",
  get: "/api/v1/model_runs/detail/",
  update: "/api/v1/model_runs/detail/",
  delete: "/api/v1/model_runs/detail/",
  import: "/api/v1/model_runs/import/",
};

export function registerModelRunAPI(
  instance: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  async function getManyModelRuns(
    query: GetModelRunQuery,
  ): Promise<ModelRunPage> {
    const params = GetModelRunQuerySchema.parse(query);
    const response = await instance.get(endpoints.getMany, { params });
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

  return {
    getMany: getManyModelRuns,
    get: getModelRun,
    update: updateModelRun,
    delete: deleteModelRun,
    import: importModelRun,
  } as const;
}
