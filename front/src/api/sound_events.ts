import { AxiosInstance } from "axios";
import { z } from "zod";

import { GetManySchema, Page } from "@/api/common";
import { GeometrySchema, SoundEventSchema } from "@/schemas";

import type { Feature, Recording, SoundEvent } from "@/types";

export const SoundEventCreateSchema = z.object({
  geometry: GeometrySchema,
});

export type SoundEventCreate = z.input<typeof SoundEventCreateSchema>;

export const SoundEventUpdateSchema = z.object({
  geometry: GeometrySchema,
});

export type SoundEventUpdate = z.input<typeof SoundEventUpdateSchema>;

export const SoundEventPageSchema = Page(SoundEventSchema);

export type SoundEventPage = z.infer<typeof SoundEventPageSchema>;

export const SoundEventFilterSchema = z.object({
  geometry_type__eq: z.string().optional(),
  created_on__before: z.date().optional(),
  created_on__after: z.date().optional(),
  recording__eq: z.string().uuid().optional(),
  feature__name: z.string().optional(),
  feature__lt: z.number().optional(),
  feature__gt: z.number().optional(),
});

export type SoundEventFilter = z.input<typeof SoundEventFilterSchema>;

export const GetSoundEventQuerySchema = z.intersection(
  GetManySchema,
  SoundEventFilterSchema,
);

export type SoundEventQuery = z.input<typeof GetSoundEventQuerySchema>;

const DEFAULT_ENDPOINTS = {
  getMany: "/api/v1/sound_events/",
  get: "/api/v1/sound_events/detail/",
  update: "/api/v1/sound_events/detail/",
  delete: "/api/v1/sound_events/detail/",
  create: "/api/v1/sound_events/",
  addFeature: "/api/v1/sound_events/detail/features/",
  updateFeature: "/api/v1/sound_events/detail/features/",
  removeFeature: "/api/v1/sound_events/detail/features/",
};

export function registerSoundEventAPI(
  axios: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  async function get(uuid: string): Promise<SoundEvent> {
    const { data } = await axios.get(endpoints.get, {
      params: { sound_event_uuid: uuid },
    });
    return SoundEventSchema.parse(data);
  }

  async function getMany(query: SoundEventQuery): Promise<SoundEventPage> {
    const params = GetSoundEventQuerySchema.parse(query);
    const { data } = await axios.get(endpoints.getMany, { params });
    return SoundEventPageSchema.parse(data);
  }

  async function createSoundEvent(
    recording: Recording,
    data: SoundEventCreate,
  ): Promise<SoundEvent> {
    const body = SoundEventCreateSchema.parse(data);
    const { data: responseData } = await axios.post(endpoints.create, body, {
      params: { recording_uuid: recording.uuid },
    });
    return SoundEventSchema.parse(responseData);
  }

  async function updateSoundEvent(
    soundEvent: SoundEvent,
    data: SoundEventUpdate,
  ): Promise<SoundEvent> {
    const body = SoundEventUpdateSchema.parse(data);
    const { data: responseData } = await axios.patch(endpoints.update, body, {
      params: { sound_event_uuid: soundEvent.uuid },
    });
    return SoundEventSchema.parse(responseData);
  }

  async function deleteSoundEvent(soundEvent: SoundEvent): Promise<SoundEvent> {
    const { data } = await axios.delete(endpoints.delete, {
      params: {
        sound_event_uuid: soundEvent.uuid,
      },
    });
    return SoundEventSchema.parse(data);
  }

  async function addFeature(soundEvent: SoundEvent, feature: Feature) {
    const { data } = await axios.post(
      endpoints.addFeature,
      {},
      {
        params: {
          sound_event_uuid: soundEvent.uuid,
          name: feature.name,
          value: feature.value,
        },
      },
    );
    return SoundEventSchema.parse(data);
  }

  async function updateFeature(soundEvent: SoundEvent, feature: Feature) {
    const { data } = await axios.patch(
      endpoints.updateFeature,
      {},
      {
        params: {
          sound_event_uuid: soundEvent.uuid,
          name: feature.name,
          value: feature.value,
        },
      },
    );
    return SoundEventSchema.parse(data);
  }

  async function removeFeature(soundEvent: SoundEvent, feature: Feature) {
    const { data } = await axios.delete(endpoints.removeFeature, {
      params: {
        sound_event_uuid: soundEvent.uuid,
        name: feature.name,
        value: feature.value,
      },
    });
    return SoundEventSchema.parse(data);
  }

  return {
    get,
    getMany,
    create: createSoundEvent,
    update: updateSoundEvent,
    delete: deleteSoundEvent,
    addFeature,
    updateFeature,
    removeFeature,
  } as const;
}
