import { AxiosInstance } from "axios";
import { z } from "zod";

import { GetManySchema, Page } from "@/lib/api/common";
import {
  ClipAnnotationSchema,
  ClipEvaluationSchema,
  ClipPredictionSchema,
  EvaluationSchema,
  FeatureFilterSchema,
  NumberFilterSchema,
  PredictedTagFilterSchema,
  TagSchema,
} from "@/schemas";

import type { ClipEvaluation } from "@/types";

export const ClipEvaluationPageSchema = Page(ClipEvaluationSchema);

export type ClipEvaluationPage = z.infer<typeof ClipEvaluationPageSchema>;

export const ClipEvaluationFilterSchema = z.object({
  clip_annotation: ClipAnnotationSchema.optional(),
  clip_prediction: ClipPredictionSchema.optional(),
  score: NumberFilterSchema.optional(),
  evaluation: EvaluationSchema.optional(),
  metric: FeatureFilterSchema.optional(),
  prediction_tag: PredictedTagFilterSchema.optional(),
  annotation_tag: TagSchema.optional(),
});

export type ClipEvaluationFilter = z.input<typeof ClipEvaluationFilterSchema>;

export const GetClipEvaluationsQuerySchema = z.intersection(
  GetManySchema,
  ClipEvaluationFilterSchema,
);

export type GetClipEvaluationsQuery = z.input<
  typeof GetClipEvaluationsQuerySchema
>;

const DEFAULT_ENDPOINTS = {
  getMany: "/api/v1/clip_evaluations/",
  get: "/api/v1/clip_evaluation/detail/",
};

export function registerClipEvaluationAPI(
  instance: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  async function getManyClipEvaluations(
    query: GetClipEvaluationsQuery,
  ): Promise<ClipEvaluationPage> {
    const params = GetClipEvaluationsQuerySchema.parse(query);
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
    return ClipEvaluationPageSchema.parse(response.data);
  }

  async function getClipEvaluation(uuid: string): Promise<ClipEvaluation> {
    const response = await instance.get(endpoints.get, {
      params: { clip_evaluation_uuid: uuid },
    });
    return ClipEvaluationSchema.parse(response.data);
  }

  return {
    getMany: getManyClipEvaluations,
    get: getClipEvaluation,
  } as const;
}
