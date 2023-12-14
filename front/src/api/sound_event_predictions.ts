import { z } from "zod";
import { AxiosInstance } from "axios";

import {
  GeometrySchema,
  SoundEventPredictionSchema,
  type ClipPrediction,
  type SoundEventPrediction,
  type Tag,
} from "@/api/schemas";
import { GetManySchema, Page } from "@/api/common";

export const SoundEventPredictionCreateSchema = z.object({
  geometry: GeometrySchema,
  score: z.number(),
});

export type SoundEventPredictionCreate = z.input<
  typeof SoundEventPredictionCreateSchema
>;

export const SoundEventPredictionUpdateSchema = z.object({
  score: z.number(),
});

export type SoundEventPredictionUpdate = z.input<
  typeof SoundEventPredictionUpdateSchema
>;

export const SoundEventPredictionFilterSchema = z.object({
  recording__eq: z.string().uuid().optional(),
  sound_event__eq: z.string().uuid().optional(),
  clip_prediction__eq: z.string().uuid().optional(),
  tag__key: z.string().optional(),
  tag__value: z.string().optional(),
  tag__gt: z.number().optional(),
  tag__lt: z.number().optional(),
  model_run__eq: z.string().uuid().optional(),
  user_run__eq: z.string().uuid().optional(),
  clip__eq: z.string().uuid().optional(),
});

export type SoundEventPredictionFilter = z.input<
  typeof SoundEventPredictionFilterSchema
>;

export const GetSoundEventPredictionsQuerySchema = z.intersection(
  GetManySchema,
  SoundEventPredictionFilterSchema,
);

export type GetSoundEventPredictionsQuery = z.input<
  typeof GetSoundEventPredictionsQuerySchema
>;

export const SoundEventPredictionPageSchema = Page(SoundEventPredictionSchema);

export type SoundEventPredictionPage = z.output<
  typeof SoundEventPredictionPageSchema
>;

const DEFAULT_ENDPOINTS = {
  create: "/api/v1/sound_event_predictions/",
  getMany: "/api/v1/sound_event_predictions/",
  delete: "/api/v1/sound_event_predictions/detail/",
  addTag: "/api/v1/sound_event_predictions/detail/",
  removeTag: "/api/v1/sound_event_predictions/detail/",
};

export function registerSoundEventPredictionsAPI(
  instance: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  async function create(
    clipPrediction: ClipPrediction,
    data: SoundEventPredictionCreate,
  ): Promise<SoundEventPrediction> {
    const body = SoundEventPredictionCreateSchema.parse(data);
    const response = await instance.post(endpoints.create, body, {
      params: { clip_prediction_uuid: clipPrediction.uuid },
    });
    return SoundEventPredictionSchema.parse(response.data);
  }

  async function getMany(
    query: GetSoundEventPredictionsQuery,
  ): Promise<SoundEventPredictionPage> {
    const params = GetSoundEventPredictionsQuerySchema.parse(query);
    const response = await instance.get(endpoints.getMany, { params });
    return SoundEventPredictionPageSchema.parse(response.data);
  }

  async function deleteSoundEventPrediction(
    soundEventPrediction: SoundEventPrediction,
  ): Promise<SoundEventPrediction> {
    const { data } = await instance.delete(endpoints.delete, {
      params: { sound_event_prediction_uuid: soundEventPrediction.uuid },
    });
    return SoundEventPredictionSchema.parse(data);
  }

  async function addTag(
    soundEventPrediction: SoundEventPrediction,
    tag: Tag,
    score: number,
  ): Promise<SoundEventPrediction> {
    const { data } = await instance.post(
      endpoints.addTag,
      {},
      {
        params: {
          sound_event_prediction_uuid: soundEventPrediction.uuid,
          key: tag.key,
          value: tag.value,
          score: score,
        },
      },
    );
    return SoundEventPredictionSchema.parse(data);
  }

  async function removeTag(
    soundEventPrediction: SoundEventPrediction,
    tag: Tag,
  ): Promise<SoundEventPrediction> {
    const { data } = await instance.delete(endpoints.removeTag, {
      params: {
        sound_event_prediction_uuid: soundEventPrediction.uuid,
        key: tag.key,
        value: tag.value,
      },
    });
    return SoundEventPredictionSchema.parse(data);
  }

  return {
    create,
    getMany,
    delete: deleteSoundEventPrediction,
    addTag,
    removeTag,
  } as const;
}
