import { AxiosInstance } from "axios";

import { GetMany, Page } from "@/lib/api/common";
import * as schemas from "@/lib/schemas";
import type * as types from "@/lib/types";

const DEFAULT_ENDPOINTS = {
  getMany: "/api/v1/sound_event_evaluations/",
};

export function registerSoundEventEvaluationAPI(
  instance: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  async function getManySoundEventEvaluations(
    query: types.GetMany & types.SoundEventEvaluationFilter,
  ): Promise<types.Page<types.SoundEventEvaluation>> {
    const params = GetMany(schemas.SoundEventEvaluationFilterSchema).parse(
      query,
    );
    const response = await instance.get(endpoints.getMany, {
      params: {
        limit: params.limit,
        offset: params.offset,
        sort_by: params.sort_by,
        clip_evaluation__eq: params.clip_evaluation?.uuid,
        score__lt: params.score?.lt,
        score__gt: params.score?.gt,
        metric__name: params.metric?.name,
        metric__lt: params.metric?.lt,
        metric__gt: params.metric?.gt,
        target__eq: params.target?.uuid,
        source__eq: params.source?.uuid,
        has_source: params.has_source,
        has_target: params.has_target,
        target_tag__key: params.target_tag?.key,
        target_tag__value: params.target_tag?.value,
        source_tag__key: params.source_tag?.tag.key,
        source_tag__value: params.source_tag?.tag.value,
        source_tag__lt: params.source_tag?.lt,
        source_tag__gt: params.source_tag?.gt,
      },
    });
    return Page(schemas.SoundEventEvaluationSchema).parse(response.data);
  }

  return {
    getMany: getManySoundEventEvaluations,
  } as const;
}
