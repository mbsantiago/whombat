import { z } from "zod";
import { AxiosInstance } from "axios";

import {
  ClipPredictionSchema,
  PredictionTagSchema,
  type ClipPrediction,
  type Tag,
} from "@/api/schemas";
import { GetManySchema, Page } from "@/api/common";

export const ClipPredictionCreateSchema = z.object({
  tags: z.array(PredictionTagSchema).optional(),
});

export type ClipPredictionCreate = z.input<typeof ClipPredictionCreateSchema>;

export const ClipPredictionFilterSchema = z.object({
  clip__eq: z.string().uuid().optional(),
  recording__eq: z.string().uuid().optional(),
  tag__key: z.string().optional(),
  tag__value: z.string().optional(),
  model_run__eq: z.string().uuid().optional(),
  user_run__eq: z.string().uuid().optional(),
});

export type ClipPredictionFilter = z.input<typeof ClipPredictionFilterSchema>;

export const GetClipPredictionsQuerySchema = z.intersection(
  GetManySchema,
  ClipPredictionFilterSchema,
);

export type GetClipPredictionsQuery = z.input<
  typeof GetClipPredictionsQuerySchema
>;

export const ClipPredictionPageSchema = Page(ClipPredictionSchema);

export type ClipPredictionPage = z.output<typeof ClipPredictionPageSchema>;

const DEFAULT_ENDPOINTS = {
  create: "/api/v1/clip_predictions/",
  getMany: "/api/v1/clip_predictions/",
  delete: "/api/v1/clip_predictions/detail/",
  addTag: "/api/v1/clip_predictions/detail/",
  removeTag: "/api/v1/clip_predictions/detail/",
};

export function registerClipPredictionsAPI(
  instance: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  async function create(
    clipPrediction: ClipPrediction,
    data: ClipPredictionCreate,
  ): Promise<ClipPrediction> {
    const body = ClipPredictionCreateSchema.parse(data);
    const response = await instance.post(endpoints.create, body, {
      params: { clip_prediction_uuid: clipPrediction.uuid },
    });
    return ClipPredictionSchema.parse(response.data);
  }

  async function getMany(
    query: GetClipPredictionsQuery,
  ): Promise<ClipPredictionPage> {
    const params = GetClipPredictionsQuerySchema.parse(query);
    const response = await instance.get(endpoints.getMany, { params });
    return ClipPredictionPageSchema.parse(response.data);
  }

  async function deleteClipPrediction(
    clipPrediction: ClipPrediction,
  ): Promise<ClipPrediction> {
    const { data } = await instance.delete(endpoints.delete, {
      params: { clip_prediction_uuid: clipPrediction.uuid },
    });
    return ClipPredictionSchema.parse(data);
  }

  async function addTag(
    clipPrediction: ClipPrediction,
    tag: Tag,
    score: number,
  ): Promise<ClipPrediction> {
    const { data } = await instance.post(
      endpoints.addTag,
      {},
      {
        params: {
          clip_prediction_uuid: clipPrediction.uuid,
          key: tag.key,
          value: tag.value,
          score: score,
        },
      },
    );
    return ClipPredictionSchema.parse(data);
  }

  async function removeTag(
    clipPrediction: ClipPrediction,
    tag: Tag,
  ): Promise<ClipPrediction> {
    const { data } = await instance.delete(endpoints.removeTag, {
      params: {
        clip_prediction_uuid: clipPrediction.uuid,
        key: tag.key,
        value: tag.value,
      },
    });
    return ClipPredictionSchema.parse(data);
  }

  return {
    create,
    getMany,
    delete: deleteClipPrediction,
    addTag,
    removeTag,
  } as const;
}
