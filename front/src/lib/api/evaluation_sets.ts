import { AxiosInstance } from "axios";
import { z } from "zod";

import { GetManySchema, Page } from "@/lib/api/common";
import { EvaluationSetSchema, PREDICTION_TYPES } from "@/lib/schemas";

import type {
  AnnotationTask,
  EvaluationSet,
  ModelRun,
  UserRun,
  Tag,
} from "@/lib/types";

export function registerEvaluationSetAPI(
  instance: AxiosInstance,
  {
    baseUrl,
    endpoints = DEFAULT_ENDPOINTS,
  }: { baseUrl?: string; endpoints?: typeof DEFAULT_ENDPOINTS } = {},
) {
  async function getManyEvaluationSets(
    query: GetEvaluationSetQuery,
  ): Promise<EvaluationSetPage> {
    const params = GetEvaluationSetQuerySchema.parse(query);
    const res = await instance.get(endpoints.getMany, { params });
    return EvaluationSetPageSchema.parse(res.data);
  }

  async function getEvaluationSet(uuid: string): Promise<EvaluationSet> {
    const res = await instance.get(endpoints.get, {
      params: { evaluation_set_uuid: uuid },
    });
    return EvaluationSetSchema.parse(res.data);
  }

  async function createEvaluationSet(
    data: EvaluationSetCreate,
  ): Promise<EvaluationSet> {
    const body = EvaluationSetCreateSchema.parse(data);
    const res = await instance.post(endpoints.create, body);
    return EvaluationSetSchema.parse(res.data);
  }

  async function updateEvaluationSet(
    evaluationSet: EvaluationSet,
    date: EvaluationSetUpdate,
  ): Promise<EvaluationSet> {
    const body = EvaluationSetUpdateSchema.parse(date);
    const response = await instance.patch(endpoints.update, body, {
      params: { evaluation_set_uuid: evaluationSet.uuid },
    });
    return EvaluationSetSchema.parse(response.data);
  }

  async function deleteEvaluationSet(
    evaluationSet: EvaluationSet,
  ): Promise<EvaluationSet> {
    const res = await instance.delete(endpoints.delete, {
      params: { evaluation_set_uuid: evaluationSet.uuid },
    });
    return EvaluationSetSchema.parse(res.data);
  }

  async function addTag(
    evaluationSet: EvaluationSet,
    tag: Tag,
  ): Promise<EvaluationSet> {
    const res = await instance.post(
      endpoints.addTag,
      {},
      {
        params: {
          evaluation_set_uuid: evaluationSet.uuid,
          key: tag.key,
          value: tag.value,
        },
      },
    );
    return EvaluationSetSchema.parse(res.data);
  }

  async function removeTag(
    evaluationSet: EvaluationSet,
    tag: Tag,
  ): Promise<EvaluationSet> {
    const res = await instance.delete(endpoints.removeTag, {
      params: {
        evaluation_set_uuid: evaluationSet.uuid,
        key: tag.key,
        value: tag.value,
      },
    });
    return EvaluationSetSchema.parse(res.data);
  }

  async function addEvaluationTasks(
    evaluationSet: EvaluationSet,
    annotationTasks: AnnotationTask[],
  ): Promise<EvaluationSet> {
    const res = await instance.post(
      endpoints.addEvaluationTasks,
      annotationTasks.map((clipAnnotation) => clipAnnotation.uuid),
      {
        params: {
          evaluation_set_uuid: evaluationSet.uuid,
        },
      },
    );
    return EvaluationSetSchema.parse(res.data);
  }

  async function addModelRun(
    evaluationSet: EvaluationSet,
    modelRun: ModelRun,
  ): Promise<EvaluationSet> {
    const res = await instance.post(
      endpoints.addModelRun,
      {},
      {
        params: {
          evaluation_set_uuid: evaluationSet.uuid,
          model_run_uuid: modelRun.uuid,
        },
      },
    );
    return EvaluationSetSchema.parse(res.data);
  }

  async function addUserRun(
    evaluationSet: EvaluationSet,
    userRun: UserRun,
  ): Promise<EvaluationSet> {
    const res = await instance.post(
      endpoints.addUserRun,
      {},
      {
        params: {
          evaluation_set_uuid: evaluationSet.uuid,
          user_run_uuid: userRun.uuid,
        },
      },
    );
    return EvaluationSetSchema.parse(res.data);
  }

  function getDownloadUrl(evaluationSet: EvaluationSet): string {
    return `${baseUrl}${endpoints.download}?evaluation_set_uuid=${evaluationSet.uuid}`;
  }

  async function importEvaluationSet(
    data: EvaluationSetImport,
  ): Promise<EvaluationSet> {
    const formData = new FormData();
    const file = data.evaluation_set[0];
    formData.append("evaluation_set", file);
    formData.append("task", data.task);
    const { data: res } = await instance.post(endpoints.import, data);
    return EvaluationSetSchema.parse(res);
  }

  return {
    get: getEvaluationSet,
    getMany: getManyEvaluationSets,
    create: createEvaluationSet,
    update: updateEvaluationSet,
    delete: deleteEvaluationSet,
    getDownloadUrl,
    addEvaluationTasks,
    addTag,
    addModelRun,
    addUserRun,
    removeTag,
    import: importEvaluationSet,
  } as const;
}

export const EvaluationSetFilterSchema = z.object({
  search: z.string().optional(),
});

export type EvaluationSetFilter = z.input<typeof EvaluationSetFilterSchema>;

export const EvaluationSetCreateSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  task: z.enum(PREDICTION_TYPES),
});

export type EvaluationSetCreate = z.input<typeof EvaluationSetCreateSchema>;

export const EvaluationSetUpdateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

export type EvaluationSetUpdate = z.input<typeof EvaluationSetUpdateSchema>;

export const EvaluationSetPageSchema = Page(EvaluationSetSchema);

export type EvaluationSetPage = z.infer<typeof EvaluationSetPageSchema>;

export const GetEvaluationSetQuerySchema = z.intersection(
  GetManySchema,
  EvaluationSetFilterSchema,
);

export type GetEvaluationSetQuery = z.input<typeof GetEvaluationSetQuerySchema>;

export const EvaluationSetImportSchema = z.object({
  evaluation_set: z.instanceof(FileList),
  task: z.string(),
});

export type EvaluationSetImport = z.infer<typeof EvaluationSetImportSchema>;

const DEFAULT_ENDPOINTS = {
  getMany: "/api/v1/evaluation_sets/",
  create: "/api/v1/evaluation_sets/",
  get: "/api/v1/evaluation_sets/detail/",
  update: "/api/v1/evaluation_sets/detail/",
  delete: "/api/v1/evaluation_sets/detail/",
  addTag: "/api/v1/evaluation_sets/detail/tags/",
  addModelRun: "/api/v1/evaluation_sets/detail/model_runs/",
  addUserRun: "/api/v1/evaluation_sets/detail/user_runs/",
  removeTag: "/api/v1/evaluation_sets/detail/tags/",
  addEvaluationTasks: "/api/v1/evaluation_sets/detail/tasks/",
  download: "/api/v1/evaluation_sets/detail/download/",
  import: "/api/v1/evaluation_sets/import/",
};
