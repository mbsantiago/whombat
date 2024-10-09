import { AxiosInstance } from "axios";

import { GetMany, Page, downloadContent } from "@/lib/api/common";
import * as schemas from "@/lib/schemas";
import type * as types from "@/lib/types";

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

export function registerEvaluationSetAPI(
  instance: AxiosInstance,
  {
    baseUrl,
    endpoints = DEFAULT_ENDPOINTS,
  }: { baseUrl?: string; endpoints?: typeof DEFAULT_ENDPOINTS } = {},
) {
  async function getManyEvaluationSets(
    query: types.GetMany & types.EvaluationSetFilter,
  ): Promise<types.Page<types.EvaluationSet>> {
    const params = GetMany(schemas.EvaluationSetFilterSchema).parse(query);
    const res = await instance.get(endpoints.getMany, { params });
    return Page(schemas.EvaluationSetSchema).parse(res.data);
  }

  async function getEvaluationSet(uuid: string): Promise<types.EvaluationSet> {
    const res = await instance.get(endpoints.get, {
      params: { evaluation_set_uuid: uuid },
    });
    return schemas.EvaluationSetSchema.parse(res.data);
  }

  async function createEvaluationSet(
    data: types.EvaluationSetCreate,
  ): Promise<types.EvaluationSet> {
    const body = schemas.EvaluationSetCreateSchema.parse(data);
    const res = await instance.post(endpoints.create, body);
    return schemas.EvaluationSetSchema.parse(res.data);
  }

  async function updateEvaluationSet(
    evaluationSet: types.EvaluationSet,
    date: types.EvaluationSetUpdate,
  ): Promise<types.EvaluationSet> {
    const body = schemas.EvaluationSetUpdateSchema.parse(date);
    const response = await instance.patch(endpoints.update, body, {
      params: { evaluation_set_uuid: evaluationSet.uuid },
    });
    return schemas.EvaluationSetSchema.parse(response.data);
  }

  async function deleteEvaluationSet(
    evaluationSet: types.EvaluationSet,
  ): Promise<types.EvaluationSet> {
    const res = await instance.delete(endpoints.delete, {
      params: { evaluation_set_uuid: evaluationSet.uuid },
    });
    return schemas.EvaluationSetSchema.parse(res.data);
  }

  async function addTag(
    evaluationSet: types.EvaluationSet,
    tag: types.Tag,
  ): Promise<types.EvaluationSet> {
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
    return schemas.EvaluationSetSchema.parse(res.data);
  }

  async function removeTag(
    evaluationSet: types.EvaluationSet,
    tag: types.Tag,
  ): Promise<types.EvaluationSet> {
    const res = await instance.delete(endpoints.removeTag, {
      params: {
        evaluation_set_uuid: evaluationSet.uuid,
        key: tag.key,
        value: tag.value,
      },
    });
    return schemas.EvaluationSetSchema.parse(res.data);
  }

  async function addEvaluationTasks(
    evaluationSet: types.EvaluationSet,
    annotationTasks: types.AnnotationTask[],
  ): Promise<types.EvaluationSet> {
    const res = await instance.post(
      endpoints.addEvaluationTasks,
      annotationTasks.map((clipAnnotation) => clipAnnotation.uuid),
      {
        params: {
          evaluation_set_uuid: evaluationSet.uuid,
        },
      },
    );
    return schemas.EvaluationSetSchema.parse(res.data);
  }

  async function addModelRun(
    evaluationSet: types.EvaluationSet,
    modelRun: types.ModelRun,
  ): Promise<types.EvaluationSet> {
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
    return schemas.EvaluationSetSchema.parse(res.data);
  }

  async function addUserRun(
    evaluationSet: types.EvaluationSet,
    userRun: types.UserRun,
  ): Promise<types.EvaluationSet> {
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
    return schemas.EvaluationSetSchema.parse(res.data);
  }

  function getDownloadUrl(evaluationSet: types.EvaluationSet): string {
    return `${baseUrl}${endpoints.download}?evaluation_set_uuid=${evaluationSet.uuid}`;
  }

  async function downloadEvaluationSet(uuid: string) {
    const { data } = await instance.get(endpoints.download, {
      params: { evaluation_set_uuid: uuid },
    });
    downloadContent(
      JSON.stringify(data),
      `evaluation-set-${uuid}.json`,
      "application/json",
    );
  }

  async function importEvaluationSet(
    data: types.EvaluationSetImport,
  ): Promise<types.EvaluationSet> {
    const formData = new FormData();
    const file = data.evaluation_set[0];
    formData.append("evaluation_set", file);
    formData.append("task", data.task);
    const { data: res } = await instance.post(endpoints.import, formData);
    return schemas.EvaluationSetSchema.parse(res);
  }

  return {
    get: getEvaluationSet,
    getMany: getManyEvaluationSets,
    create: createEvaluationSet,
    update: updateEvaluationSet,
    delete: deleteEvaluationSet,
    download: downloadEvaluationSet,
    getDownloadUrl,
    addEvaluationTasks,
    addTag,
    addModelRun,
    addUserRun,
    removeTag,
    import: importEvaluationSet,
  } as const;
}
