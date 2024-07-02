import { AxiosInstance } from "axios";
import { z } from "zod";

import { GetManySchema, Page } from "@/lib/api/common";
import {
  ClipEvaluationSchema,
  FeatureFilterSchema,
  NumberFilterSchema,
  PredictedTagFilterSchema,
  SoundEventAnnotationSchema,
  SoundEventEvaluationSchema,
  SoundEventPredictionSchema,
  TagSchema,
} from "@/lib/schemas";

export const SoundEventEvaluationPageSchema = Page(SoundEventEvaluationSchema);

export type SoundEventEvaluationPage = z.infer<
  typeof SoundEventEvaluationPageSchema
>;

export const SoundEventEvaluationFilterSchema = z.object({
  clip_evaluation: ClipEvaluationSchema.optional(),
  score: NumberFilterSchema.optional(),
  metric: FeatureFilterSchema.optional(),
  target: SoundEventAnnotationSchema.optional(),
  source: SoundEventPredictionSchema.optional(),
  has_source: z.boolean().optional(),
  has_target: z.boolean().optional(),
  target_tag: TagSchema.optional(),
  source_tag: PredictedTagFilterSchema.optional(),
});

export type SoundEventEvaluationFilter = z.input<
  typeof SoundEventEvaluationFilterSchema
>;

export const GetSoundEventEvaluationsQuerySchema = z.intersection(
  GetManySchema,
  SoundEventEvaluationFilterSchema,
);

export type GetSoundEventEvaluationsQuery = z.input<
  typeof GetSoundEventEvaluationsQuerySchema
>;

const DEFAULT_ENDPOINTS = {
  getMany: "/api/v1/sound_event_evaluations/",
};

export function registerSoundEventEvaluationAPI(
  instance: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  async function getManySoundEventEvaluations(
    query: GetSoundEventEvaluationsQuery,
  ): Promise<SoundEventEvaluationPage> {
    const params = GetSoundEventEvaluationsQuerySchema.parse(query);
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
    return SoundEventEvaluationPageSchema.parse(response.data);
  }

  return {
    getMany: getManySoundEventEvaluations,
  } as const;
}
