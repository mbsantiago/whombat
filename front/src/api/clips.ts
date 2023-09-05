import { z } from "zod";
import { AxiosInstance } from "axios";
import { RecordingSchema } from "@/api/recordings";
import { TagSchema } from "@/api/tags";
import { FeatureSchema } from "@/api/features";
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

export type ClipCreate = z.infer<typeof ClipCreateSchema>;

export const ClipSchema = z
  .object({
    id: z.number(),
    start_time: z.number(),
    end_time: z.number(),
    recording: RecordingSchema,
    tags: z.array(TagSchema),
    features: z.array(FeatureSchema),
  })
  .refine((clip) => clip.start_time < clip.end_time, {
    message: "Start time must be less than end time",
  });

export type Clip = z.infer<typeof ClipSchema>;

export const ClipPageSchema = Page(ClipSchema);

export type ClipPage = z.infer<typeof ClipPageSchema>;

export const ClipFilterSchema = z.object({
  recording__eq: z.number().optional(),
  recording__isin: z.array(z.number()).optional(),
  tag__eq: z.number().optional(),
  tag__isin: z.array(z.number()).optional(),
});

export type ClipFilter = z.infer<typeof ClipFilterSchema>;

export const GetClipsSchema = z.intersection(GetManySchema, ClipFilterSchema);

export type GetClips = z.infer<typeof GetClipsSchema>;

const DEFAULT_ENDPOINTS = {
  createMany: "/api/v1/clips/",
};

export function registerClipApi(
  api: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  return {
    createMany: async (data: ClipCreate[]) => {
      const response = await api.post<Clip[]>(endpoints.createMany, data);
      return response.data;
    },
  };
}
