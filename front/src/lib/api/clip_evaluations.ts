import { AxiosInstance } from "axios";

import { GetMany, Page } from "@/lib/api/common";
import * as schemas from "@/lib/schemas";
import type * as types from "@/lib/types";

const DEFAULT_ENDPOINTS = {
  getMany: "/api/v1/clip_evaluations/",
  get: "/api/v1/clip_evaluation/detail/",
};

export function registerClipEvaluationAPI(
  instance: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  async function getManyClipEvaluations(
    query: types.GetMany & types.ClipEvaluationFilter,
  ): Promise<types.Page<types.ClipEvaluation>> {
    const params = GetMany(schemas.ClipEvaluationFilterSchema).parse(query);
    const response = await instance.get(endpoints.getMany, {
      params: {
        limit: params.limit,
        offset: params.offset,
        sort_by: params.sort_by,
        clip_annotation__eq: params.clip_annotation?.uuid,
        clip_prediction__eq: params.clip_prediction?.uuid,
        score__lt: params.score?.lt,
        score__gt: params.score?.gt,
        evaluation__eq: params.evaluation?.uuid,
        metric__name: params.metric?.name,
        metric__lt: params.metric?.lt,
        metric__gt: params.metric?.gt,
        prediction_tag__key: params.prediction_tag?.tag.key,
        prediction_tag__value: params.prediction_tag?.tag.value,
        prediction_tag__gt: params.prediction_tag?.gt,
        prediction_tag__lt: params.prediction_tag?.lt,
        annotation_tag__key: params.annotation_tag?.key,
        annotation_tag__value: params.annotation_tag?.value,
      },
    });
    return Page(schemas.ClipEvaluationSchema).parse(response.data);
  }

  async function getClipEvaluation(
    uuid: string,
  ): Promise<types.ClipEvaluation> {
    const response = await instance.get(endpoints.get, {
      params: { clip_evaluation_uuid: uuid },
    });
    return schemas.ClipEvaluationSchema.parse(response.data);
  }

  return {
    getMany: getManyClipEvaluations,
    get: getClipEvaluation,
  } as const;
}
