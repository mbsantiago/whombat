import { z } from "zod";
import { AxiosInstance } from "axios";

import { FeatureSchema } from "@/api/features";
import { TagSchema } from "@/api/tags";

import { GetManySchema, Page } from "./common";

export const GeometrySchema = z.object({
  type: z.string(),
  coordinates: z.union([
    z.number(),
    z.array(z.number()),
    z.array(z.array(z.number())),
    z.array(z.array(z.array(z.number()))),
  ]),
});

export type Geometry = z.infer<typeof GeometrySchema>;

export const SoundEventCreateSchema = z.object({
  recording_id: z.number(),
  geometry: GeometrySchema,
});

export type SoundEventCreate = z.infer<typeof SoundEventCreateSchema>;

export const SoundEventSchema = SoundEventCreateSchema.extend({
  id: z.number(),
  tags: z.array(TagSchema),
  features: z.array(FeatureSchema),
  created_at: z.coerce.date(),
});

export type SoundEvent = z.infer<typeof SoundEventSchema>;

export const SoundEventUpdateSchema = z.object({
  geometry: GeometrySchema,
});

export type SoundEventUpdate = z.infer<typeof SoundEventUpdateSchema>;

export const SoundEventPageSchema = Page(SoundEventSchema);

export type SoundEventPage = z.infer<typeof SoundEventPageSchema>;

export const SoundEventFilterSchema = z.object({
  tag__eq: z.number().optional(),
  tag__isin: z.array(z.number()).optional(),
  geometry_type__eq: z.string().optional(),
  geometry_type__isin: z.array(z.string()).optional(),
  created_at__before: z.date().optional(),
  created_at__after: z.date().optional(),
  recording__eq: z.number().optional(),
  recording__isin: z.array(z.number()).optional(),
  recording_tag__eq: z.number().optional(),
  recording_tag__isin: z.array(z.number()).optional(),
});

export type SoundEventFilter = z.infer<typeof SoundEventFilterSchema>;

export const SoundEventGetManySchema = z.intersection(
  GetManySchema,
  SoundEventFilterSchema,
);

export type SoundEventGetMany = z.infer<typeof SoundEventGetManySchema>;

const DEFAULT_ENDPOINTS = {
  getMany: "/api/v1/sound_events/",
  get: "/api/v1/sound_events/detail/",
  update: "/api/v1/sound_events/detail/",
  delete: "/api/v1/sound_events/detail/",
  create: "/api/v1/sound_events/",
  addTag: "/api/v1/sound_events/detail/tags/",
  removeTag: "/api/v1/sound_events/detail/tags/",
  addFeature: "/api/v1/sound_events/detail/features/",
  updateFeature: "/api/v1/sound_events/detail/features/",
  removeFeature: "/api/v1/sound_events/detail/features/",
};

export function registerSoundEventApi(
  axios: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  async function get(sound_event_id: number) {
    const { data } = await axios.get(endpoints.get, {
      params: { sound_event_id },
    });
    return SoundEventSchema.parse(data);
  }

  async function getMany(query: SoundEventGetMany) {
    const params = SoundEventGetManySchema.parse(query);
    const { data } = await axios.get(endpoints.getMany, { params });
    return SoundEventPageSchema.parse(data);
  }

  async function create(data: SoundEventCreate) {
    const body = SoundEventCreateSchema.parse(data);
    const { data: responseData } = await axios.post(endpoints.create, body);
    return SoundEventSchema.parse(responseData);
  }

  async function update(sound_event_id: number, data: SoundEventUpdate) {
    const body = SoundEventUpdateSchema.parse(data);
    const { data: responseData } = await axios.patch(endpoints.update, body, {
      params: { sound_event_id },
    });
    return SoundEventSchema.parse(responseData);
  }

  async function delete_(sound_event_id: number) {
    const { data } = await axios.delete(endpoints.delete, {
      params: { sound_event_id },
    });
    return SoundEventSchema.parse(data);
  }

  async function addTag(sound_event_id: number, tag_id: number) {
    const { data } = await axios.post(endpoints.addTag, null, {
      params: { sound_event_id, tag_id },
    });
    return SoundEventSchema.parse(data);
  }

  async function removeTag(sound_event_id: number, tag_id: number) {
    const { data } = await axios.delete(endpoints.removeTag, {
      params: { sound_event_id, tag_id },
    });
    return SoundEventSchema.parse(data);
  }

  async function addFeature(sound_event_id: number, feature_name_id: number, value: number) {
    const { data } = await axios.post(endpoints.addFeature, { feature_name_id, value }, {
      params: { sound_event_id },
    });
    return SoundEventSchema.parse(data);
  }

  // TODO: Seguir

  return {
    get,
    getMany,
    create,
    update,
    delete: delete_,
    addTag,
    removeTag,
    addFeature,
  };
}
