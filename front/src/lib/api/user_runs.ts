import { AxiosInstance } from "axios";

import { GetMany, Page } from "@/lib/api/common";
import * as schemas from "@/lib/schemas";
import type * as types from "@/lib/types";

const DEFAULT_ENDPOINTS = {
  getMany: "/api/v1/user_runs/",
  get: "/api/v1/user_runs/detail/",
  create: "/api/v1/user_runs/",
  delete: "/api/v1/user_runs/detail/",
};

export function registerUserRunAPI(
  instance: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  async function createUserRun(): Promise<types.UserRun> {
    const response = await instance.post(endpoints.create);
    return schemas.UserRunSchema.parse(response.data);
  }

  async function getManyUserRuns(
    query: types.GetMany & types.UserRunFilter,
  ): Promise<types.Page<types.UserRun>> {
    const params = GetMany(schemas.UserRunFilterSchema).parse(query);
    const response = await instance.get(endpoints.getMany, {
      params: {
        limit: params.limit,
        offset: params.offset,
        sort_by: params.sort_by,
        user__eq: params.user?.id,
        evaluated__eq: params.evaluated,
        score__lt: params.score?.lt,
        score__gt: params.score?.gt,
        evaluation_set__eq: params.evaluation_set?.uuid,
        has_evaluation__eq: params.has_evaluation,
      },
    });
    return Page(schemas.UserRunSchema).parse(response.data);
  }

  async function getUserRun(uuid: string): Promise<types.UserRun> {
    const response = await instance.get(endpoints.get, {
      params: { user_run_uuid: uuid },
    });
    return schemas.UserRunSchema.parse(response.data);
  }

  async function deleteUserRun(userRun: types.UserRun): Promise<types.UserRun> {
    const response = await instance.delete(endpoints.delete, {
      params: { user_run_uuid: userRun.uuid },
    });
    return schemas.UserRunSchema.parse(response.data);
  }

  return {
    create: createUserRun,
    getMany: getManyUserRuns,
    get: getUserRun,
    delete: deleteUserRun,
  } as const;
}
