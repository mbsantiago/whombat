import { AxiosInstance } from "axios";

import { GetMany, Page } from "@/lib/api/common";
import * as schemas from "@/lib/schemas";
import * as types from "@/lib/types";

const DEFAULT_ENDPOINTS = {
  create: "/api/v1/sound_event_annotations/",
  getMany: "/api/v1/sound_event_annotations/",
  get: "/api/v1/sound_event_annotations/detail/",
  getTags: "/api/v1/sound_event_annotations/tags/",
  getAnnotationTask: "/api/v1/sound_event_annotations/detail/annotation_task/",
  getScatterPlotData: "/api/v1/sound_event_annotations/scatter_plot/",
  update: "/api/v1/sound_event_annotations/detail/",
  delete: "/api/v1/sound_event_annotations/detail/",
  addTag: "/api/v1/sound_event_annotations/detail/tags/",
  removeTag: "/api/v1/sound_event_annotations/detail/tags/",
  addNote: "/api/v1/sound_event_annotations/detail/notes/",
  removeNote: "/api/v1/sound_event_annotations/detail/notes/",
};

export function registerSoundEventAnnotationsAPI(
  instance: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  async function create(
    clipAnnotation: types.ClipAnnotation,
    data: types.SoundEventAnnotationCreate,
  ): Promise<types.SoundEventAnnotation> {
    const body = schemas.SoundEventAnnotationCreateSchema.parse(data);
    const response = await instance.post(endpoints.create, body, {
      params: { clip_annotation_uuid: clipAnnotation.uuid },
    });
    return schemas.SoundEventAnnotationSchema.parse(response.data);
  }

  async function getMany(
    query: types.GetMany & types.SoundEventAnnotationFilter,
  ): Promise<types.Page<types.SoundEventAnnotation>> {
    const params = GetMany(schemas.SoundEventAnnotationFilterSchema).parse(
      query,
    );
    const response = await instance.get(endpoints.getMany, {
      params: {
        limit: params.limit,
        offset: params.offset,
        sort_by: params.sort_by,
        annotation_project__eq: params.annotation_project?.uuid,
        recording__eq: params.recording?.uuid,
        sound_event__eq: params.sound_event?.uuid,
        created_by__eq: params.created_by?.id,
        tag__key: params.tag?.key,
        tag__value: params.tag?.value,
      },
    });
    return Page(schemas.SoundEventAnnotationSchema).parse(response.data);
  }

  async function getScatterPlotData(
    query: types.GetMany & types.SoundEventAnnotationFilter,
  ): Promise<types.Page<types.ScatterPlotData>> {
    const params = GetMany(schemas.SoundEventAnnotationFilterSchema).parse(
      query,
    );
    const response = await instance.get(endpoints.getScatterPlotData, {
      params: {
        limit: params.limit,
        offset: params.offset,
        sort_by: params.sort_by,
        annotation_project__eq: params.annotation_project?.uuid,
        recording__eq: params.recording?.uuid,
        sound_event__eq: params.sound_event?.uuid,
        created_by__eq: params.created_by?.id,
        tag__key: params.tag?.key,
        tag__value: params.tag?.value,
      },
    });
    return Page(schemas.ScatterPlotDataSchema).parse(response.data);
  }

  async function getSoundEventAnnotation(
    uuid: string,
  ): Promise<types.SoundEventAnnotation> {
    const response = await instance.get(endpoints.get, {
      params: { sound_event_annotation_uuid: uuid },
    });
    return schemas.SoundEventAnnotationSchema.parse(response.data);
  }

  async function getAnnotationTask(
    uuid: string,
  ): Promise<types.AnnotationTask> {
    const response = await instance.get(endpoints.getAnnotationTask, {
      params: { sound_event_annotation_uuid: uuid },
    });
    return schemas.AnnotationTaskSchema.parse(response.data);
  }

  async function updateSoundEventAnnotation(
    soundEventAnnotation: types.SoundEventAnnotation,
    data: types.SoundEventAnnotationUpdate,
  ): Promise<types.SoundEventAnnotation> {
    const body = schemas.SoundEventAnnotationUpdateSchema.parse(data);
    const response = await instance.patch(endpoints.update, body, {
      params: {
        sound_event_annotation_uuid: soundEventAnnotation.uuid,
      },
    });
    return schemas.SoundEventAnnotationSchema.parse(response.data);
  }

  async function deleteSoundEventAnnotation(
    soundEventAnnotation: types.SoundEventAnnotation,
  ): Promise<types.SoundEventAnnotation> {
    const response = await instance.delete(endpoints.delete, {
      params: {
        sound_event_annotation_uuid: soundEventAnnotation.uuid,
      },
    });
    return schemas.SoundEventAnnotationSchema.parse(response.data);
  }

  async function addTag(
    soundEventAnnotation: types.SoundEventAnnotation,
    tag: types.Tag,
  ): Promise<types.SoundEventAnnotation> {
    const response = await instance.post(
      endpoints.addTag,
      {},
      {
        params: {
          sound_event_annotation_uuid: soundEventAnnotation.uuid,
          key: tag.key,
          value: tag.value,
        },
      },
    );
    return schemas.SoundEventAnnotationSchema.parse(response.data);
  }

  async function removeTag(
    soundEventAnnotation: types.SoundEventAnnotation,
    tag: types.Tag,
  ): Promise<types.SoundEventAnnotation> {
    const response = await instance.delete(endpoints.removeTag, {
      params: {
        sound_event_annotation_uuid: soundEventAnnotation.uuid,
        key: tag.key,
        value: tag.value,
      },
    });
    return schemas.SoundEventAnnotationSchema.parse(response.data);
  }

  async function addNote(
    soundEventAnnotation: types.SoundEventAnnotation,
    data: types.NoteCreate,
  ): Promise<types.SoundEventAnnotation> {
    const body = schemas.NoteCreateSchema.parse(data);
    const response = await instance.post(endpoints.addNote, body, {
      params: {
        sound_event_annotation_uuid: soundEventAnnotation.uuid,
      },
    });
    return schemas.SoundEventAnnotationSchema.parse(response.data);
  }

  async function removeNote(
    soundEventAnnotation: types.SoundEventAnnotation,
    note: types.Note,
  ): Promise<types.SoundEventAnnotation> {
    const response = await instance.delete(endpoints.removeNote, {
      params: {
        sound_event_annotation_uuid: soundEventAnnotation.uuid,
        note_uuid: note.uuid,
      },
    });
    return schemas.SoundEventAnnotationSchema.parse(response.data);
  }

  return {
    create,
    getMany,
    get: getSoundEventAnnotation,
    getAnnotationTask,
    update: updateSoundEventAnnotation,
    addTag,
    removeTag,
    addNote,
    removeNote,
    getScatterPlotData,
    delete: deleteSoundEventAnnotation,
  } as const;
}
