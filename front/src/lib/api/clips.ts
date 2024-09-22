import { AxiosInstance } from "axios";
import { z } from "zod";

import {
  ClipSchema,
  DatasetSchema,
  FeatureFilterSchema,
  NumberFilterSchema,
  RecordingSchema,
} from "@/lib/schemas";
import type { Clip } from "@/lib/types";

import { GetManySchema, Page } from "./common";

export const ClipCreateSchema = z
  .object({
    start_time: z.number(),
    end_time: z.number(),
  })
  .refine((clip) => clip.start_time < clip.end_time, {
    message: "Start time must be less than end time",
  });

export type ClipCreate = z.input<typeof ClipCreateSchema>;

export const ClipCreateManySchema = z.array(
  z.tuple([z.string().uuid(), ClipCreateSchema]),
);

export type ClipCreateMany = z.input<typeof ClipCreateManySchema>;

export const ClipPageSchema = Page(ClipSchema);

export type ClipPage = z.infer<typeof ClipPageSchema>;

export const ClipFilterSchema = z.object({
  recording: RecordingSchema.optional(),
  dataset: DatasetSchema.optional(),
  start_time: NumberFilterSchema.optional(),
  end_time: NumberFilterSchema.optional(),
  feature: FeatureFilterSchema.optional(),
});

export type ClipFilter = z.input<typeof ClipFilterSchema>;

export const GetClipsQuerySchema = z.intersection(
  GetManySchema,
  ClipFilterSchema,
);

export type GetClipsQuery = z.input<typeof GetClipsQuerySchema>;

const DEFAULT_ENDPOINTS = {
  createMany: "/api/v1/clips/",
  getMany: "/api/v1/clips/",
  delete: "/api/v1/clips/detail/",
};

export function registerClipAPI(
  api: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  async function getMany(query: GetClipsQuery): Promise<ClipPage> {
    const params = GetClipsQuerySchema.parse(query);
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
    return response.data;
  }

  async function createMany(data: ClipCreateMany): Promise<Clip[]> {
    const response = await api.post(endpoints.createMany, data);
    return response.data;
  }

  async function deleteClip(clip: Clip): Promise<Clip> {
    const response = await api.delete(endpoints.delete, {
      params: { clip_uuid: clip.uuid },
    });
    return response.data;
  }

  return {
    getMany,
    createMany,
    delete: deleteClip,
  } as const;
}
