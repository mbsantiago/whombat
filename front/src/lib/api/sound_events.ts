import { AxiosInstance } from "axios";
import { z } from "zod";

import { GetManySchema, Page } from "@/lib/api/common";
import {
  DateFilterSchema,
  FeatureFilterSchema,
  GeometrySchema,
  RecordingSchema,
  SoundEventSchema,
} from "@/schemas";

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
  geometry_type: z.string().optional(),
  created_on: DateFilterSchema.optional(),
  recording: RecordingSchema.optional(),
  feature: FeatureFilterSchema.optional(),
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
  getRecording: "/api/v1/sound_events/detail/recording/",
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
    const { data } = await axios.get(endpoints.getMany, {
      params: {
        limit: params.limit,
        offset: params.offset,
        sort_by: params.sort_by,
        geometry_type__eq: params.geometry_type,
        created_on__before: params.created_on?.before,
        created_on__after: params.created_on?.after,
        created_on__on: params.created_on?.on,
        recording__eq: params.recording?.uuid,
        feature__name: params.feature?.name,
        feature__gt: params.feature?.gt,
        feature__lt: params.feature?.lt,
      },
    });
    return SoundEventPageSchema.parse(data);
  }

  async function getRecording(soundEvent: SoundEvent): Promise<Recording> {
    const { data } = await axios.get(endpoints.getRecording, {
      params: { sound_event_uuid: soundEvent.uuid },
    });
    return RecordingSchema.parse(data);
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
    getRecording,
    updateFeature,
    removeFeature,
  } as const;
}
