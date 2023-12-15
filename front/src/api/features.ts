import { z } from "zod";
import { AxiosInstance } from "axios";

import { GetManySchema, Page } from "./common";

export const FeatureFilterSchema = z.object({
  search: z.string().optional(),
});

export type FeatureFilter = z.infer<typeof FeatureFilterSchema>;

export const FeaturePageSchema = Page(z.string());

export type FeaturePage = z.infer<typeof FeaturePageSchema>;

export const GetFeatureQuerySchema = z.intersection(
  FeatureFilterSchema,
  GetManySchema,
);

export type GetFeatureQuery = z.infer<typeof GetFeatureQuerySchema>;

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
  async function getMany(query: GetFeatureQuery): Promise<FeaturePage> {
    const params = GetFeatureQuerySchema.parse(query);
    const { data } = await instance.get(endpoints.getMany, { params });
    return FeaturePageSchema.parse(data);
  }

  return {
    getMany,
  } as const;
}
