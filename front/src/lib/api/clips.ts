import { AxiosInstance } from "axios";
import { z } from "zod";

import * as schemas from "@/lib/schemas";
import type * as types from "@/lib/types";

import { GetMany, Page } from "./common";

const DEFAULT_ENDPOINTS = {
  createMany: "/api/v1/clips/",
  getMany: "/api/v1/clips/",
  delete: "/api/v1/clips/detail/",
};

export function registerClipAPI(
  api: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  async function getMany(
    query: types.GetMany & types.ClipFilter,
  ): Promise<types.Page<types.Clip>> {
    const params = GetMany(schemas.ClipFilterSchema).parse(query);
    const response = await api.get(endpoints.getMany, {
      params: {
        limit: params.limit,
        offset: params.offset,
        sort_by: params.sort_by,
        recording__eq: params.recording?.uuid,
        dataset__eq: params.dataset?.uuid,
        start_time__lt: params.start_time?.lt,
        start_time__gt: params.start_time?.gt,
        end_time__lt: params.end_time?.lt,
        end_time__gt: params.end_time?.gt,
        feature__name: params.feature?.name,
        feature__lt: params.feature?.lt,
        feature__gt: params.feature?.gt,
      },
    });
    return Page(schemas.ClipSchema).parse(response.data);
  }

  async function createMany(data: types.ClipCreateMany): Promise<types.Clip[]> {
    const response = await api.post(endpoints.createMany, data);
    return z.array(schemas.ClipSchema).parse(response.data);
  }

  async function deleteClip(clip: types.Clip): Promise<types.Clip> {
    const response = await api.delete(endpoints.delete, {
      params: { clip_uuid: clip.uuid },
    });
    return schemas.ClipSchema.parse(response.data);
  }

  return {
    getMany,
    createMany,
    delete: deleteClip,
  } as const;
}
