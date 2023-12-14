import { z } from "zod";
import { AxiosInstance } from "axios";

import { ClipEvaluationSchema, type ClipEvaluation } from "@/api/schemas";
import { GetManySchema, Page } from "@/api/common";

export const ClipEvaluationPageSchema = Page(ClipEvaluationSchema);

export type ClipEvaluationPage = z.infer<typeof ClipEvaluationPageSchema>;

export const ClipEvaluationFilterSchema = z.object({
  clip_annotation__eq: z.string().uuid().optional(),
  clip_prediction__eq: z.string().uuid().optional(),
  score__lt: z.number().optional(),
  score__gt: z.number().optional(),
  evaluation__eq: z.string().uuid().optional(),
  metric__name: z.string().optional(),
  metric__lt: z.number().optional(),
  metric__gt: z.number().optional(),
  prediction_tag__key: z.string().optional(),
  prediction_tag__value: z.string().optional(),
  prediction_tag__lt: z.number().optional(),
  prediction_tag__gt: z.number().optional(),
  annotation_tag__key: z.string().optional(),
  annotation_tag__value: z.string().optional(),
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
    const response = await instance.get(endpoints.getMany, { params });
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
