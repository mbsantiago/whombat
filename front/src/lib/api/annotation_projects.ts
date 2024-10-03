import { AxiosInstance } from "axios";

import { GetMany, Page, downloadContent } from "@/lib/api/common";
import * as schemas from "@/lib/schemas";
import type * as types from "@/lib/types";

const DEFAULT_ENDPOINTS = {
  getMany: "/api/v1/annotation_projects/",
  create: "/api/v1/annotation_projects/",
  get: "/api/v1/annotation_projects/detail/",
  update: "/api/v1/annotation_projects/detail/",
  delete: "/api/v1/annotation_projects/detail/",
  addTag: "/api/v1/annotation_projects/detail/tags/",
  removeTag: "/api/v1/annotation_projects/detail/tags/",
  download: "/api/v1/annotation_projects/detail/download/",
  import: "/api/v1/annotation_projects/import/",
};

export function registerAnnotationProjectAPI(
  instance: AxiosInstance,
  {
    endpoints = DEFAULT_ENDPOINTS,
    baseUrl = "",
  }: {
    endpoints?: typeof DEFAULT_ENDPOINTS;
    baseUrl?: string;
  },
) {
  async function getMany(
    query: types.GetMany & types.AnnotationProjectFilter,
  ): Promise<types.Page<types.AnnotationProject>> {
    const params = GetMany(schemas.AnnotationProjectFilterSchema).parse(query);
    const { data } = await instance.get(endpoints.getMany, { params });
    return Page(schemas.AnnotationProjectSchema).parse(data);
  }

  async function get(uuid: string): Promise<types.AnnotationProject> {
    const { data } = await instance.get(endpoints.get, {
      params: { annotation_project_uuid: uuid },
    });
    return schemas.AnnotationProjectSchema.parse(data);
  }

  async function create(
    data: types.AnnotationProjectCreate,
  ): Promise<types.AnnotationProject> {
    const body = schemas.AnnotationProjectCreateSchema.parse(data);
    const { data: responseData } = await instance.post(endpoints.create, body);
    return schemas.AnnotationProjectSchema.parse(responseData);
  }

  async function update(
    annotationProject: types.AnnotationProject,
    data: types.AnnotationProjectUpdate,
  ): Promise<types.AnnotationProject> {
    const body = schemas.AnnotationProjectUpdateSchema.parse(data);
    const { data: responseData } = await instance.patch(
      endpoints.update,
      body,
      {
        params: { annotation_project_uuid: annotationProject.uuid },
      },
    );
    return schemas.AnnotationProjectSchema.parse(responseData);
  }

  async function deleteAnnotationProject(
    annotationProject: types.AnnotationProject,
  ): Promise<types.AnnotationProject> {
    const { data } = await instance.delete(endpoints.delete, {
      params: { annotation_project_uuid: annotationProject.uuid },
    });
    return schemas.AnnotationProjectSchema.parse(data);
  }

  async function addTag(
    annotationProject: types.AnnotationProject,
    tag: types.Tag,
  ): Promise<types.AnnotationProject> {
    const { data } = await instance.post(
      endpoints.addTag,
      {},
      {
        params: {
          annotation_project_uuid: annotationProject.uuid,
          key: tag.key,
          value: tag.value,
        },
      },
    );
    return schemas.AnnotationProjectSchema.parse(data);
  }

  async function removeTag(
    annotationProject: types.AnnotationProject,
    tag: types.Tag,
  ): Promise<types.AnnotationProject> {
    const { data } = await instance.delete(endpoints.removeTag, {
      params: {
        annotation_project_uuid: annotationProject.uuid,
        key: tag.key,
        value: tag.value,
      },
    });
    return schemas.AnnotationProjectSchema.parse(data);
  }

  function getDownloadUrl(annotationProject: types.AnnotationProject): string {
    return `${baseUrl}${endpoints.download}?annotation_project_uuid=${annotationProject.uuid}`;
  }

  async function download(uuid: string) {
    const { data } = await instance.get(endpoints.download, {
      params: { annotation_project_uuid: uuid },
    });
    downloadContent(
      JSON.stringify(data),
      `annotation-project-${uuid}.json`,
      "application/json",
    );
  }

  async function importProject(
    data: types.AnnotationProjectImport,
  ): Promise<types.AnnotationProject> {
    const formData = new FormData();
    const file = data.annotation_project[0];
    formData.append("annotation_project", file);
    const { data: res } = await instance.post(endpoints.import, formData);
    return schemas.AnnotationProjectSchema.parse(res);
  }

  return {
    getMany,
    get,
    create,
    update,
    delete: deleteAnnotationProject,
    addTag,
    removeTag,
    import: importProject,
    download,
    getDownloadUrl,
  } as const;
}
