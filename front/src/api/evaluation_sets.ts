import { z } from "zod";
import { AxiosInstance } from "axios";

import { GetManySchema, Page } from "@/api/common";
import { TagSchema } from "@/api/tags";

const DEFAULT_ENDPOINTS = {
  getMany: "/api/v1/evaluation_sets/",
  create: "/api/v1/evaluation_sets/",
  get: "/api/v1/evaluation_sets/detail/",
  update: "/api/v1/evaluation_sets/detail/",
  delete: "/api/v1/evaluation_sets/detail/",
  addTag: "/api/v1/annotation_projects/detail/tags/",
  removeTag: "/api/v1/annotation_projects/detail/tags/",
};

export const EvaluationSetFilterSchema = z.object({
  search: z.string().optional(),
});

export type EvaluationSetFilter = z.infer<typeof EvaluationSetFilterSchema>;

export const EvaluationSetCreateSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
});

export type EvaluationSetCreate = z.infer<typeof EvaluationSetCreateSchema>;

export const EvaluationSetSchema = EvaluationSetCreateSchema.extend({
  id: z.number(),
  uuid: z.string().uuid(),
  created_at: z.coerce.date(),
  tags: z.array(TagSchema),
});

export type EvaluationSet = z.infer<typeof EvaluationSetSchema>;

export const EvaluationSetUpdateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

export type EvaluationSetUpdate = z.infer<typeof EvaluationSetUpdateSchema>;

export const EvaluationSetPageSchema = Page(EvaluationSetSchema);

export type EvaluationSetPage = z.infer<typeof EvaluationSetPageSchema>;

export const EvaluationSetGetManySchema = z.intersection(
  GetManySchema,
  EvaluationSetFilterSchema,
);

export type EvaluationSetGetMany = z.infer<typeof EvaluationSetGetManySchema>;

export function registerEvaluationSetAPI(
  instance: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  async function getMany(
    params: EvaluationSetGetMany,
  ): Promise<EvaluationSetPage> {
    const res = await instance.get(endpoints.getMany, { params });
    return EvaluationSetPageSchema.parse(res.data);
  }

  async function get(evaluation_set_id: number): Promise<EvaluationSet> {
    const res = await instance.get(endpoints.get, {
      params: { evaluation_set_id },
    });
    return EvaluationSetSchema.parse(res.data);
  }

  async function create(data: EvaluationSetCreate): Promise<EvaluationSet> {
    const res = await instance.post(endpoints.create, data);
    return EvaluationSetSchema.parse(res.data);
  }

  async function update(
    evaluation_set_id: number,
    data: EvaluationSetUpdate,
  ): Promise<EvaluationSet> {
    const res = await instance.patch(endpoints.update, data, {
      params: { evaluation_set_id },
    });
    return EvaluationSetSchema.parse(res.data);
  }

  async function delete_(evaluation_set_id: number): Promise<EvaluationSet> {
    const res = await instance.delete(endpoints.delete, {
      params: { evaluation_set_id },
    });
    return EvaluationSetSchema.parse(res.data);
  }

  async function addTag(
    evaluation_set_id: number,
    tag_id: number,
  ): Promise<EvaluationSet> {
    const res = await instance.post(
      endpoints.addTag,
      {},
      { params: { evaluation_set_id, tag_id } },
    );
    return EvaluationSetSchema.parse(res.data);
  }

  async function removeTag(
    evaluation_set_id: number,
    tag_id: number,
  ): Promise<EvaluationSet> {
    const res = await instance.delete(endpoints.removeTag, {
      params: { evaluation_set_id, tag_id },
    });
    return EvaluationSetSchema.parse(res.data);
  }

  return {
    get,
    getMany,
    create,
    update,
    delete: delete_,
    addTag,
    removeTag,
  };
}
