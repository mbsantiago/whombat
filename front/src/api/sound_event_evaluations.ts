import { z } from "zod";
import { AxiosInstance } from "axios";

import { SoundEventEvaluationSchema } from "@/api/schemas";
import { GetManySchema, Page } from "@/api/common";

export const SoundEventEvaluationPageSchema = Page(SoundEventEvaluationSchema);

export type SoundEventEvaluationPage = z.infer<
  typeof SoundEventEvaluationPageSchema
>;

export const SoundEventEvaluationFilterSchema = z.object({
  clip_evaluation__eq: z.string().uuid().optional(),
  score__gt: z.number().optional(),
  score__lt: z.number().optional(),
  metric__name: z.string().optional(),
  metric__gt: z.number().optional(),
  metric__lt: z.number().optional(),
  target__eq: z.string().uuid().optional(),
  source__eq: z.string().uuid().optional(),
  has_source__eq: z.boolean().optional(),
  has_target__eq: z.boolean().optional(),
  target_tag__key: z.string().optional(),
  target_tag__value: z.string().optional(),
  source_tag__key: z.string().optional(),
  source_tag__value: z.string().optional(),
  source_tag__lt: z.string().optional(),
  source_tag__gt: z.string().optional(),
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
    const response = await instance.get(endpoints.getMany, { params });
    return SoundEventEvaluationPageSchema.parse(response.data);
  }

  return {
    getMany: getManySoundEventEvaluations,
  } as const;
}
