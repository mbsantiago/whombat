import { AxiosInstance } from "axios";
import { z } from "zod";

import { GetManySchema, Page } from "@/lib/api/common";
import {
  ClipPredictionSchema,
  ClipSchema,
  GeometrySchema,
  ModelRunSchema,
  PredictedTagFilterSchema,
  RecordingSchema,
  SoundEventPredictionSchema,
  SoundEventSchema,
  UserRunSchema,
} from "@/lib/schemas";
import type { ClipPrediction, SoundEventPrediction, Tag } from "@/lib/types";

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
  recording: RecordingSchema.optional(),
  sound_event: SoundEventSchema.optional(),
  clip_prediction: ClipPredictionSchema.optional(),
  tag: PredictedTagFilterSchema.optional(),
  model_run: ModelRunSchema.optional(),
  user_run: UserRunSchema.optional(),
  clip: ClipSchema.optional(),
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
    const response = await instance.get(endpoints.getMany, {
      params: {
        limit: params.limit,
        offset: params.offset,
        sort_by: params.sort_by,
        recording__eq: params.recording?.uuid,
        sound_event__eq: params.sound_event?.uuid,
        clip_prediction__eq: params.clip_prediction?.uuid,
        tag__key: params.tag?.tag.key,
        tag__value: params.tag?.tag.value,
        tag__gt: params.tag?.gt,
        tag__lt: params.tag?.lt,
        model_run__eq: params.model_run?.uuid,
        user_run__eq: params.user_run?.uuid,
        clip__eq: params.clip?.uuid,
      },
    });
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
