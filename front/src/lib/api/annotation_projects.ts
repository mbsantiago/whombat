import { AxiosInstance } from "axios";
import { z } from "zod";

import { GetManySchema, Page } from "@/lib/api/common";
import { AnnotationProjectSchema } from "@/schemas";

import type { AnnotationProject, Tag } from "@/lib/types";

const DEFAULT_ENDPOINTS = {
  getMany: "/api/v1/annotation_projects/",
  get: "/api/v1/annotation_projects/detail/",
  create: "/api/v1/annotation_projects/",
  update: "/api/v1/annotation_projects/detail/",
  delete: "/api/v1/annotation_projects/detail/",
  addTag: "/api/v1/annotation_projects/detail/tags/",
  removeTag: "/api/v1/annotation_projects/detail/tags/",
  download: "/api/v1/annotation_projects/detail/download/",
  import: "/api/v1/annotation_projects/import/",
};

export const AnnotationProjectFilterSchema = z.object({
  search: z.string().optional(),
});

export type AnnotationProjectFilter = z.input<
  typeof AnnotationProjectFilterSchema
>;

export const AnnotationProjectCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  annotation_instructions: z.string().nullable().optional(),
});

export type AnnotationProjectCreate = z.input<
  typeof AnnotationProjectCreateSchema
>;

export const AnnotationProjectUpdateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  annotation_instructions: z.string().optional(),
});

export type AnnotationProjectUpdate = z.input<
  typeof AnnotationProjectUpdateSchema
>;

export const AnnotationProjectPageSchema = Page(AnnotationProjectSchema);

export type AnnotationProjectPage = z.infer<typeof AnnotationProjectPageSchema>;

export const GetAnnotationProjectsQuerySchema = z.intersection(
  GetManySchema,
  AnnotationProjectFilterSchema,
);

export type GetAnnotationProjectsQuery = z.input<
  typeof GetAnnotationProjectsQuerySchema
>;

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
    query: GetAnnotationProjectsQuery,
  ): Promise<AnnotationProjectPage> {
    const params = GetAnnotationProjectsQuerySchema.parse(query);
    const { data } = await instance.get(endpoints.getMany, { params });
    return AnnotationProjectPageSchema.parse(data);
  }

  async function get(uuid: string): Promise<AnnotationProject> {
    const { data } = await instance.get(endpoints.get, {
      params: { annotation_project_uuid: uuid },
    });
    return AnnotationProjectSchema.parse(data);
  }

  async function create(
    data: AnnotationProjectCreate,
  ): Promise<AnnotationProject> {
    const body = AnnotationProjectCreateSchema.parse(data);
    const { data: responseData } = await instance.post(endpoints.create, body);
    return AnnotationProjectSchema.parse(responseData);
  }

  async function update(
    annotationProject: AnnotationProject,
    data: AnnotationProjectUpdate,
  ): Promise<AnnotationProject> {
    const body = AnnotationProjectUpdateSchema.parse(data);
    const { data: responseData } = await instance.patch(
      endpoints.update,
      body,
      {
        params: { annotation_project_uuid: annotationProject.uuid },
      },
    );
    return AnnotationProjectSchema.parse(responseData);
  }

  async function deleteAnnotationProject(
    annotationProject: AnnotationProject,
  ): Promise<AnnotationProject> {
    const { data } = await instance.delete(endpoints.delete, {
      params: { annotation_project_uuid: annotationProject.uuid },
    });
    return AnnotationProjectSchema.parse(data);
  }

  async function addTag(
    annotationProject: AnnotationProject,
    tag: Tag,
  ): Promise<AnnotationProject> {
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
    return AnnotationProjectSchema.parse(data);
  }

  async function removeTag(
    annotationProject: AnnotationProject,
    tag: Tag,
  ): Promise<AnnotationProject> {
    const { data } = await instance.delete(endpoints.removeTag, {
      params: {
        annotation_project_uuid: annotationProject.uuid,
        key: tag.key,
        value: tag.value,
      },
    });
    return AnnotationProjectSchema.parse(data);
  }

  function getDownloadUrl(annotationProject: AnnotationProject): string {
    return `${baseUrl}${endpoints.download}?annotation_project_uuid=${annotationProject.uuid}`;
  }

  async function importProject(data: FormData): Promise<AnnotationProject> {
    const { data: res } = await instance.post(endpoints.import, data);
    return AnnotationProjectSchema.parse(res);
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
    getDownloadUrl,
  } as const;
}
