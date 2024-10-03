import { AxiosInstance } from "axios";

import { GetMany, Page } from "@/lib/api/common";
import * as schemas from "@/lib/schemas";
import type * as types from "@/lib/types";

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
  async function get(uuid: string): Promise<types.SoundEvent> {
    const { data } = await axios.get(endpoints.get, {
      params: { sound_event_uuid: uuid },
    });
    return schemas.SoundEventSchema.parse(data);
  }

  async function getMany(
    query: types.GetMany & types.SoundEventFilter,
  ): Promise<types.Page<types.SoundEvent>> {
    const params = GetMany(schemas.SoundEventFilterSchema).parse(query);
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
    return Page(schemas.SoundEventSchema).parse(data);
  }

  async function getRecording(
    soundEvent: types.SoundEvent,
  ): Promise<types.Recording> {
    const { data } = await axios.get(endpoints.getRecording, {
      params: { sound_event_uuid: soundEvent.uuid },
    });
    return schemas.RecordingSchema.parse(data);
  }

  async function createSoundEvent(
    recording: types.Recording,
    data: types.SoundEventCreate,
  ): Promise<types.SoundEvent> {
    const body = schemas.SoundEventCreateSchema.parse(data);
    const { data: responseData } = await axios.post(endpoints.create, body, {
      params: { recording_uuid: recording.uuid },
    });
    return schemas.SoundEventSchema.parse(responseData);
  }

  async function updateSoundEvent(
    soundEvent: types.SoundEvent,
    data: types.SoundEventUpdate,
  ): Promise<types.SoundEvent> {
    const body = schemas.SoundEventUpdateSchema.parse(data);
    const { data: responseData } = await axios.patch(endpoints.update, body, {
      params: { sound_event_uuid: soundEvent.uuid },
    });
    return schemas.SoundEventSchema.parse(responseData);
  }

  async function deleteSoundEvent(
    soundEvent: types.SoundEvent,
  ): Promise<types.SoundEvent> {
    const { data } = await axios.delete(endpoints.delete, {
      params: {
        sound_event_uuid: soundEvent.uuid,
      },
    });
    return schemas.SoundEventSchema.parse(data);
  }

  async function addFeature(
    soundEvent: types.SoundEvent,
    feature: types.Feature,
  ) {
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
    return schemas.SoundEventSchema.parse(data);
  }

  async function updateFeature(
    soundEvent: types.SoundEvent,
    feature: types.Feature,
  ) {
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
    return schemas.SoundEventSchema.parse(data);
  }

  async function removeFeature(
    soundEvent: types.SoundEvent,
    feature: types.Feature,
  ) {
    const { data } = await axios.delete(endpoints.removeFeature, {
      params: {
        sound_event_uuid: soundEvent.uuid,
        name: feature.name,
        value: feature.value,
      },
    });
    return schemas.SoundEventSchema.parse(data);
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
