import { z } from "zod";
import { AxiosInstance } from "axios";
import { GetManySchema, Page } from "./common";
import { TagSchema } from "./tags";

const DEFAULT_ENDPOINTS = {
  getMany: "/api/v1/annotation_projects/",
  create: "/api/v1/annotation_projects/",
  get: "/api/v1/annotation_projects/detail/",
  update: "/api/v1/annotation_projects/detail/",
  delete: "/api/v1/annotation_projects/detail/",
  addClips: "/api/v1/annotation_projects/detail/clips/",
  removeClips: "/api/v1/annotation_projects/detail/clips/",
  addTag: "/api/v1/annotation_projects/detail/tags/",
  removeTag: "/api/v1/annotation_projects/detail/tags/",
};

export const AnnotationProjectFilterSchema = z.object({
  search: z.string().optional(),
});

export type AnnotationProjectFilter = z.infer<
  typeof AnnotationProjectFilterSchema
>;

export const AnnotationProjectSchema = z.object({
  id: z.number().int(),
  uuid: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  annotation_instructions: z.string().optional(),
  created_at: z.coerce.date(),
  tags: z.array(TagSchema),
});

export type AnnotationProject = z.infer<typeof AnnotationProjectSchema>;

export const AnnotationProjectCreateSchema = z.object({
  name: z.string(),
  description: z.string(),
  annotation_instructions: z.string().optional(),
});

export type AnnotationProjectCreate = z.infer<
  typeof AnnotationProjectCreateSchema
>;

export const AnnotationProjectUpdateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  annotation_instructions: z.string().optional(),
});

export type AnnotationProjectUpdate = z.infer<
  typeof AnnotationProjectUpdateSchema
>;

export const AnnotationProjectPageSchema = Page(AnnotationProjectSchema);

export type AnnotationProjectPage = z.infer<typeof AnnotationProjectPageSchema>;

export const GetAnnotationProjectsSchema = z.intersection(
  GetManySchema,
  AnnotationProjectFilterSchema,
);

export type GetAnnotationProjects = z.infer<typeof GetAnnotationProjectsSchema>;

export function registerAnnotationProjectAPI(
  instance: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  async function getMany(params: z.infer<typeof GetAnnotationProjectsSchema>) {
    const { data } = await instance.get(endpoints.getMany, { params });
    return AnnotationProjectPageSchema.parse(data);
  }

  async function get(annotation_project_id: number) {
    const { data } = await instance.get(endpoints.get, {
      params: {
        annotation_project_id,
      },
    });
    return AnnotationProjectSchema.parse(data);
  }

  async function create(data: z.infer<typeof AnnotationProjectCreateSchema>) {
    const { data: responseData } = await instance.post(endpoints.create, data);
    return AnnotationProjectSchema.parse(responseData);
  }

  async function update(
    annotation_project_id: number,
    data: z.infer<typeof AnnotationProjectUpdateSchema>,
  ) {
    const { data: responseData } = await instance.patch(
      endpoints.update,
      data,
      {
        params: {
          annotation_project_id,
        },
      },
    );
    return AnnotationProjectSchema.parse(responseData);
  }

  async function delete_(annotation_project_id: number) {
    const { data } = await instance.delete(endpoints.delete, {
      params: {
        annotation_project_id,
      },
    });
    return AnnotationProjectSchema.parse(data);
  }

  async function addClips(annotation_project_id: number, clip_ids: number[]) {
    const { data } = await instance.post(
      endpoints.addClips,
      {
        clip_ids,
      },
      {
        params: {
          annotation_project_id,
        },
      },
    );
    return AnnotationProjectSchema.parse(data);
  }

  async function removeClips(
    annotation_project_id: number,
    clip_ids: number[],
  ) {
    const { data } = await instance.delete(endpoints.removeClips, {
      params: {
        annotation_project_id,
        clip_ids,
      },
    });
    return AnnotationProjectSchema.parse(data);
  }

  async function addTag(annotation_project_id: number, tag_id: number) {
    const { data } = await instance.post(
      endpoints.addTag,
      {},
      {
        params: {
          annotation_project_id,
          tag_id,
        },
      },
    );
    return AnnotationProjectSchema.parse(data);
  }

  async function removeTag(annotation_project_id: number, tag_id: number) {
    const { data } = await instance.delete(endpoints.removeTag, {
      params: {
        annotation_project_id,
        tag_id,
      },
    });
    return AnnotationProjectSchema.parse(data);
  }

  return {
    getMany,
    get,
    create,
    update,
    delete: delete_,
    addClips,
    removeClips,
    addTag,
    removeTag,
  };
}
