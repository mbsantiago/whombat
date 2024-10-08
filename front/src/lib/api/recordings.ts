import { AxiosInstance } from "axios";

import { GetMany, Page, downloadContent } from "@/lib/api/common";
import * as schemas from "@/lib/schemas";
import type * as types from "@/lib/types";

const DEFAULT_ENDPOINTS = {
  getMany: "/api/v1/recordings/",
  get: "/api/v1/recordings/detail/",
  update: "/api/v1/recordings/detail/",
  download: "/api/v1/audio/download/",
  delete: "/api/v1/recordings/detail/",
  addTag: "/api/v1/recordings/detail/tags/",
  removeTag: "/api/v1/recordings/detail/tags/",
  addNote: "/api/v1/recordings/detail/notes/",
  removeNote: "/api/v1/recordings/detail/notes/",
  addFeature: "/api/v1/recordings/detail/features/",
  removeFeature: "/api/v1/recordings/detail/features/",
  updateFeature: "/api/v1/recordings/detail/features/",
};

export function registerRecordingAPI(
  instance: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  async function getMany(
    query: types.GetMany & types.RecordingFilter,
  ): Promise<types.Page<types.Recording>> {
    const params = GetMany(schemas.RecordingFilterSchema).parse(query);
    const { data } = await instance.get(endpoints.getMany, {
      params: {
        limit: params.limit,
        offset: params.offset,
        sort_by: params.sort_by,
        search: params.search,
        dataset__eq: params.dataset?.uuid,
        duration__gt: params.duration?.gt,
        duration__lt: params.duration?.lt,
        latitude__gt: params.latitude?.gt,
        latitude__lt: params.latitude?.lt,
        latitude__is_null: params.latitude?.is_null,
        longitude__gt: params.longitude?.gt,
        longitude__lt: params.longitude?.lt,
        longitude__is_null: params.longitude?.is_null,
        time_expansion__gt: params.time_expansion?.gt,
        time_expansion__lt: params.time_expansion?.lt,
        tag__key: params.tag?.key,
        tag__value: params.tag?.value,
        has_issues__eq: params.has_issues,
        date__before: params.date?.before,
        date__after: params.date?.after,
        date__on: params.date?.on,
        date__is_null: params.date?.is_null,
        time__before: params.time?.before,
        time__after: params.time?.after,
        time__is_null: params.time?.is_null,
      },
    });
    return Page(schemas.RecordingSchema).parse(data);
  }

  async function get(uuid: string): Promise<types.Recording> {
    const { data } = await instance.get(endpoints.get, {
      params: { recording_uuid: uuid },
    });
    return schemas.RecordingSchema.parse(data);
  }

  async function update(
    recording: types.Recording,
    data: types.RecordingUpdate,
  ): Promise<types.Recording> {
    const body = schemas.RecordingUpdateSchema.parse(data);
    const { data: res } = await instance.patch(endpoints.update, body, {
      params: { recording_uuid: recording.uuid },
    });
    return schemas.RecordingSchema.parse(res);
  }

  async function deleteRecording(
    recording: types.Recording,
  ): Promise<types.Recording> {
    const { data: res } = await instance.delete(endpoints.delete, {
      params: { recording_uuid: recording.uuid },
    });
    return schemas.RecordingSchema.parse(res);
  }

  async function addTag(
    recording: types.Recording,
    tag: types.Tag,
  ): Promise<types.Recording> {
    const { data } = await instance.post(
      endpoints.addTag,
      {},
      {
        params: {
          recording_uuid: recording.uuid,
          key: tag.key,
          value: tag.value,
        },
      },
    );
    return schemas.RecordingSchema.parse(data);
  }

  async function removeTag(
    recording: types.Recording,
    tag: types.Tag,
  ): Promise<types.Recording> {
    const { data } = await instance.delete(endpoints.removeTag, {
      params: {
        recording_uuid: recording.uuid,
        key: tag.key,
        value: tag.value,
      },
    });
    return schemas.RecordingSchema.parse(data);
  }

  async function addNote(
    recording: types.Recording,
    data: types.NoteCreate,
  ): Promise<types.Recording> {
    const { data: updated } = await instance.post(endpoints.addNote, data, {
      params: { recording_uuid: recording.uuid },
    });
    return schemas.RecordingSchema.parse(updated);
  }

  async function removeNote(
    recording: types.Recording,
    note: types.Note,
  ): Promise<types.Recording> {
    const { data } = await instance.delete(endpoints.removeNote, {
      params: {
        recording_uuid: recording.uuid,
        note_uuid: note.uuid,
      },
    });
    return schemas.RecordingSchema.parse(data);
  }

  async function addFeature(
    recording: types.Recording,
    feature: types.Feature,
  ): Promise<types.Recording> {
    const { data } = await instance.post(
      endpoints.addFeature,
      {},
      {
        params: {
          recording_uuid: recording.uuid,
          name: feature.name,
          value: feature.value,
        },
      },
    );
    return schemas.RecordingSchema.parse(data);
  }

  async function removeFeature(
    recording: types.Recording,
    feature: types.Feature,
  ): Promise<types.Recording> {
    const { data } = await instance.delete(endpoints.removeFeature, {
      params: {
        recording_uuid: recording.uuid,
        name: feature.name,
        value: feature.value,
      },
    });
    return schemas.RecordingSchema.parse(data);
  }

  async function updateFeature(
    recording: types.Recording,
    feature: types.Feature,
  ): Promise<types.Recording> {
    const { data } = await instance.patch(
      endpoints.updateFeature,
      {},
      {
        params: {
          recording_uuid: recording.uuid,
          name: feature.name,
          value: feature.value,
        },
      },
    );
    return schemas.RecordingSchema.parse(data);
  }

  async function downloadRecording(uuid: string) {
    const { data } = await instance.get(endpoints.download, {
      params: { recording_uuid: uuid },
    });
    downloadContent(data, `${uuid}.wav`, "audio/wav");
  }

  return {
    getMany,
    get,
    update,
    delete: deleteRecording,
    download: downloadRecording,
    addTag,
    removeTag,
    addNote,
    removeNote,
    addFeature,
    removeFeature,
    updateFeature,
  } as const;
}
