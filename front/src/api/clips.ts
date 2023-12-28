import { AxiosInstance } from "axios";
import { z } from "zod";

import { ClipSchema } from "@/schemas";

import { GetManySchema, Page } from "./common";

import type { Clip } from "@/types";

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
  recording__eq: z.string().uuid().optional(),
  dataset__eq: z.string().uuid().optional(),
  start_time__gt: z.number().optional(),
  start_time__lt: z.number().optional(),
  end_time__gt: z.number().optional(),
  end_time__lt: z.number().optional(),
  feature__name: z.string().optional(),
  feature__gt: z.number().optional(),
  feature__lt: z.number().optional(),
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
    const response = await api.get(endpoints.getMany, { params });
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
