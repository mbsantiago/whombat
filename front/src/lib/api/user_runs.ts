import { AxiosInstance } from "axios";
import { z } from "zod";

import { GetManySchema, Page } from "@/lib/api/common";
import {
  EvaluationSetSchema,
  NumberFilterSchema,
  UserRunSchema,
  UserSchema,
} from "@/lib/schemas";

import type { UserRun } from "@/lib/types";

export const UserRunFilterSchema = z.object({
  user: UserSchema.optional(),
  evaluated: z.boolean().optional(),
  score: NumberFilterSchema.optional(),
  evaluation_set: EvaluationSetSchema.optional(),
  has_evaluation: z.boolean().optional(),
});

export type UserRunFilter = z.input<typeof UserRunFilterSchema>;

export const GetUserRunQuerySchema = z.intersection(
  GetManySchema,
  UserRunFilterSchema,
);

export type GetUserRunQuery = z.input<typeof GetUserRunQuerySchema>;

export const UserRunPageSchema = Page(UserRunSchema);

export type UserRunPage = z.infer<typeof UserRunPageSchema>;

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
  async function createUserRun(): Promise<UserRun> {
    const response = await instance.post(endpoints.create);
    return UserRunSchema.parse(response.data);
  }

  async function getManyUserRuns(query: GetUserRunQuery): Promise<UserRunPage> {
    const params = GetUserRunQuerySchema.parse(query);
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
    return UserRunPageSchema.parse(response.data);
  }

  async function getUserRun(uuid: string): Promise<UserRun> {
    const response = await instance.get(endpoints.get, {
      params: { user_run_uuid: uuid },
    });
    return UserRunSchema.parse(response.data);
  }

  async function deleteUserRun(userRun: UserRun): Promise<UserRun> {
    const response = await instance.delete(endpoints.delete, {
      params: { user_run_uuid: userRun.uuid },
    });
    return UserRunSchema.parse(response.data);
  }

  return {
    create: createUserRun,
    getMany: getManyUserRuns,
    get: getUserRun,
    delete: deleteUserRun,
  } as const;
}
