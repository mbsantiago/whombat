import { AxiosInstance } from "axios";

import { GetMany, Page } from "@/lib/api/common";
import * as schemas from "@/lib/schemas";
import type * as types from "@/lib/types";

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
    clipPrediction: types.ClipPrediction,
    data: types.ClipPredictionCreate,
  ): Promise<types.ClipPrediction> {
    const body = schemas.ClipPredictionCreateSchema.parse(data);
    const response = await instance.post(endpoints.create, body, {
      params: { clip_prediction_uuid: clipPrediction.uuid },
    });
    return schemas.ClipPredictionSchema.parse(response.data);
  }

  async function getMany(
    query: types.GetMany & types.ClipPredictionFilter,
  ): Promise<types.Page<types.ClipPrediction>> {
    const params = GetMany(schemas.ClipPredictionFilterSchema).parse(query);
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
    return Page(schemas.ClipPredictionSchema).parse(response.data);
  }

  async function deleteClipPrediction(
    clipPrediction: types.ClipPrediction,
  ): Promise<types.ClipPrediction> {
    const { data } = await instance.delete(endpoints.delete, {
      params: { clip_prediction_uuid: clipPrediction.uuid },
    });
    return schemas.ClipPredictionSchema.parse(data);
  }

  async function addTag(
    clipPrediction: types.ClipPrediction,
    tag: types.Tag,
    score: number,
  ): Promise<types.ClipPrediction> {
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
    return schemas.ClipPredictionSchema.parse(data);
  }

  async function removeTag(
    clipPrediction: types.ClipPrediction,
    tag: types.Tag,
  ): Promise<types.ClipPrediction> {
    const { data } = await instance.delete(endpoints.removeTag, {
      params: {
        clip_prediction_uuid: clipPrediction.uuid,
        key: tag.key,
        value: tag.value,
      },
    });
    return schemas.ClipPredictionSchema.parse(data);
  }

  return {
    create,
    getMany,
    delete: deleteClipPrediction,
    addTag,
    removeTag,
  } as const;
}
