import { AxiosInstance } from "axios";

import * as schemas from "@/lib/schemas";
import type * as types from "@/lib/types";

import { GetMany, Page } from "./common";

const DEFAULT_ENDPOINTS = {
  getMany: "/api/v1/features/",
};

export function registerFeatureAPI({
  instance,
  endpoints = DEFAULT_ENDPOINTS,
}: {
  instance: AxiosInstance;
  endpoints?: typeof DEFAULT_ENDPOINTS;
}) {
  async function getMany(
    query: types.GetMany & types.FeatureFilter,
  ): Promise<types.Page<types.Feature>> {
    const params = GetMany(schemas.FeatureFilterSchema).parse(query);
    const { data } = await instance.get(endpoints.getMany, { params });
    return Page(schemas.FeatureSchema).parse(data);
  }

  return {
    getMany,
  } as const;
}
