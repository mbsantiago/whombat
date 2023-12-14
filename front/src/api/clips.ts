import { z } from "zod";
import { AxiosInstance } from "axios";

import { type Clip, ClipSchema } from "@/api/schemas";

import { GetManySchema, Page } from "./common";

export const ClipCreateSchema = z
  .object({
    recording_id: z.number(),
    start_time: z.number(),
    end_time: z.number(),
  })
  .refine((clip) => clip.start_time < clip.end_time, {
    message: "Start time must be less than end time",
  });

export type ClipCreate = z.input<typeof ClipCreateSchema>;

export const ClipPageSchema = Page(ClipSchema);

export type ClipPage = z.infer<typeof ClipPageSchema>;

export const ClipFilterSchema = z.object({
  recording__eq: z.number().optional(),
  recording__isin: z.array(z.number()).optional(),
  tag__eq: z.number().optional(),
  tag__isin: z.array(z.number()).optional(),
});

export type ClipFilter = z.input<typeof ClipFilterSchema>;

export const GetClipsSchema = z.intersection(GetManySchema, ClipFilterSchema);

export type GetClips = z.infer<typeof GetClipsSchema>;

const DEFAULT_ENDPOINTS = {
  createMany: "/api/v1/clips/",
  getMany: "/api/v1/clips/",
  delete: "/api/v1/clips/detail/",
};

export function registerClipAPI(
  api: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  async function getMany(query: GetClips): Promise<ClipPage> {
    const params = GetClipsSchema.parse(query);
    const response = await api.get(endpoints.getMany, { params });
    return response.data;
  }

  async function createMany(data: ClipCreate[]): Promise<Clip[]> {
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
