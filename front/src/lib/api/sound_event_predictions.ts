import { AxiosInstance } from "axios";

import { GetMany, Page } from "@/lib/api/common";
import * as schemas from "@/lib/schemas";
import type * as types from "@/lib/types";

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
    clipPrediction: types.ClipPrediction,
    data: types.SoundEventPredictionCreate,
  ): Promise<types.SoundEventPrediction> {
    const body = schemas.SoundEventPredictionCreateSchema.parse(data);
    const response = await instance.post(endpoints.create, body, {
      params: { clip_prediction_uuid: clipPrediction.uuid },
    });
    return schemas.SoundEventPredictionSchema.parse(response.data);
  }

  async function getMany(
    query: types.GetMany & types.SoundEventPredictionFilter,
  ): Promise<types.Page<types.SoundEventPrediction>> {
    const params = GetMany(schemas.SoundEventPredictionFilterSchema).parse(
      query,
    );
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
    return Page(schemas.SoundEventPredictionSchema).parse(response.data);
  }

  async function deleteSoundEventPrediction(
    soundEventPrediction: types.SoundEventPrediction,
  ): Promise<types.SoundEventPrediction> {
    const { data } = await instance.delete(endpoints.delete, {
      params: { sound_event_prediction_uuid: soundEventPrediction.uuid },
    });
    return schemas.SoundEventPredictionSchema.parse(data);
  }

  async function addTag(
    soundEventPrediction: types.SoundEventPrediction,
    tag: types.Tag,
    score: number,
  ): Promise<types.SoundEventPrediction> {
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
    return schemas.SoundEventPredictionSchema.parse(data);
  }

  async function removeTag(
    soundEventPrediction: types.SoundEventPrediction,
    tag: types.Tag,
  ): Promise<types.SoundEventPrediction> {
    const { data } = await instance.delete(endpoints.removeTag, {
      params: {
        sound_event_prediction_uuid: soundEventPrediction.uuid,
        key: tag.key,
        value: tag.value,
      },
    });
    return schemas.SoundEventPredictionSchema.parse(data);
  }

  return {
    create,
    getMany,
    delete: deleteSoundEventPrediction,
    addTag,
    removeTag,
  } as const;
}
