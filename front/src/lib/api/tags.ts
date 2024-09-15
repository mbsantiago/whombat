import { AxiosInstance } from "axios";
import { z } from "zod";

import { GetManySchema, Page } from "@/lib/api/common";
import {
  AnnotationProjectSchema,
  ClipAnnotationSchema,
  ClipPredictionSchema,
  DatasetSchema,
  EvaluationSchema,
  RecordingSchema,
  SoundEventAnnotationSchema,
  SoundEventPredictionSchema,
  StringFilterSchema,
  TagSchema,
} from "@/lib/schemas";

import type { Tag } from "@/lib/types";
import { table } from "console";

export function registerTagAPI(
  instance: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  async function getTags(query: GetTagsQuery): Promise<TagPage> {
    const params = GetTagsQuerySchema.parse(query);
    const response = await instance.get(endpoints.get, {
      params: {
        limit: params.limit,
        offset: params.offset,
        sort_by: params.sort_by,
        search: params.search,
        key__eq: params.key,
        value__eq: params.value?.eq,
        value__has: params.value?.has,
        annotation_project__eq: params.annotation_project?.uuid,
        recording__eq: params.recording?.uuid,
        sound_event_annotation__eq: params.sound_event_annotation?.uuid,
        clip_annotation__eq: params.clip_annotation?.uuid,
        sound_event_prediction__eq: params.sound_event_prediction?.uuid,
        clip_prediction__eq: params.clip_prediction?.uuid,
        evaluation_set__eq: params.evaluation_set?.uuid,
        dataset__eq: params.dataset?.uuid,
      },
    });
    return response.data;
  }

  async function getRecordingTags(
    query: GetRecordingTagsQuery,
  ): Promise<RecordingTagPage> {
    const params = GetRecordingTagsQuerySchema.parse(query);
    const response = await instance.get(endpoints.getRecordingTags, {
      params: {
        limit: params.limit,
        offset: params.offset,
        sort_by: params.sort_by,
        recording__eq: params.recording?.uuid,
        dataset__eq: params.dataset?.uuid,
        tag__key: params.tag?.key,
        tag__value: params.tag?.value,
        issue__eq: params.issue,
      },
    });
    return response.data;
  }

  async function createTag(data: TagCreate): Promise<Tag> {
    const response = await instance.post(endpoints.create, data);
    return TagSchema.parse(response.data);
  }

  return { get: getTags, create: createTag, getRecordingTags } as const;
}

export const TagPageSchema = Page(TagSchema);

export type TagPage = z.infer<typeof TagPageSchema>;

export const TagCreateSchema = z.object({
  key: z.string(),
  value: z.string(),
});

export type TagCreate = z.input<typeof TagCreateSchema>;

export const RecordingTagSchema = z.object({
  tag: TagSchema,
  recording_uuid: z.string().uuid(),
});

export const ClipTagSchema = z.object({
  tag: TagSchema,
  clip_uuid: z.string().uuid(),
});

export const SoundEventTagSchema = z.object({
  tag: TagSchema,
  sound_event_uuid: z.string().uuid(),
});

export type RecordingTag = z.infer<typeof RecordingTagSchema>;

export type ClipTag = z.infer<typeof ClipTagSchema>;

export type SoundEventTag = z.infer<typeof SoundEventTagSchema>;

export const RecordingTagPageSchema = Page(RecordingTagSchema);

export type RecordingTagPage = z.infer<typeof RecordingTagPageSchema>;

export const TagFilterSchema = z.object({
  search: z.string().optional(),
  key: z.string().optional(),
  value: StringFilterSchema.optional(),
  annotation_project: AnnotationProjectSchema.optional(),
  recording: RecordingSchema.optional(),
  sound_event_annotation: SoundEventAnnotationSchema.optional(),
  clip_annotation: ClipAnnotationSchema.optional(),
  sound_event_prediction: SoundEventPredictionSchema.optional(),
  clip_prediction: ClipPredictionSchema.optional(),
  evaluation_set: EvaluationSchema.optional(),
  dataset: DatasetSchema.optional(),
});

export type TagFilter = z.input<typeof TagFilterSchema>;

export const RecordingTagFilterSchema = z.object({
  recording: RecordingSchema.optional(),
  dataset: DatasetSchema.optional(),
  tag: TagSchema.optional(),
  issue: z.boolean().optional(),
});

export type RecordingTagFilter = z.input<typeof RecordingTagFilterSchema>;

export const GetTagsQuerySchema = z.intersection(
  GetManySchema,
  TagFilterSchema,
);

export type GetTagsQuery = z.input<typeof GetTagsQuerySchema>;

export const GetRecordingTagsQuerySchema = z.intersection(
  GetManySchema,
  RecordingTagFilterSchema,
);

export type GetRecordingTagsQuery = z.input<typeof GetRecordingTagsQuerySchema>;

const DEFAULT_ENDPOINTS = {
  get: "/api/v1/tags/",
  getRecordingTags: "/api/v1/tags/recording_tags/",
  create: "/api/v1/tags/",
};
