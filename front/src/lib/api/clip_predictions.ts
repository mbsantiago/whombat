import { AxiosInstance } from "axios";
import { z } from "zod";

import { GetManySchema, Page } from "@/lib/api/common";
import {
  ClipPredictionSchema,
  ClipSchema,
  ModelRunSchema,
  PredictedTagFilterSchema,
  PredictionTagSchema,
  RecordingSchema,
  UserRunSchema,
} from "@/lib/schemas";
import type { ClipPrediction, Tag } from "@/lib/types";

export const ClipPredictionCreateSchema = z.object({
  tags: z.array(PredictionTagSchema).optional(),
});

export type ClipPredictionCreate = z.input<typeof ClipPredictionCreateSchema>;

export const ClipPredictionFilterSchema = z.object({
  clip: ClipSchema.optional(),
  recording: RecordingSchema.optional(),
  tag: PredictedTagFilterSchema.optional(),
  sound_event_tag: PredictedTagFilterSchema.optional(),
  model_run: ModelRunSchema.optional(),
  user_run: UserRunSchema.optional(),
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
    const response = await instance.get(endpoints.getMany, {
      params: {
        limit: params.limit,
        offset: params.offset,
        sort_by: params.sort_by,
        clip__eq: params.clip?.uuid,
        recording__eq: params.recording?.uuid,
        tag__key: params.tag?.tag.key,
        tag__value: params.tag?.tag.value,
        tag__gt: params.tag?.gt,
        tag__lt: params.tag?.lt,
        sound_event_tag__key: params.sound_event_tag?.tag.key,
        sound_event_tag__value: params.sound_event_tag?.tag.value,
        sound_event_tag__gt: params.sound_event_tag?.gt,
        sound_event_tag__lt: params.sound_event_tag?.lt,
        model_run__eq: params.model_run?.uuid,
        user_run__eq: params.user_run?.uuid,
      },
    });
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
