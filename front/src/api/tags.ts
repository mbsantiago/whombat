import { z } from "zod";
import { AxiosInstance } from "axios";
import { GetManySchema, Page } from "./common";

const TagCreateSchema = z.object({
  name: z.string(),
  key: z.string(),
});

type TagCreate = z.infer<typeof TagCreateSchema>;

const TagSchema = TagCreateSchema.extend({
  id: z.number(),
});

type Tag = z.infer<typeof TagSchema>;

const TagPageSchema = Page(TagSchema);

type TagPage = z.infer<typeof TagPageSchema>;

const TagFilterSchema = z.object({
  search: z.string().optional(),
  key: z.string().optional(),
  value: z.string().optional(),
});

type TagFilter = z.infer<typeof TagFilterSchema>;

const DEFAULT_ENDPOINTS = {
  get: "/api/v1/tags",
  create: "/api/v1/tags",
};

const GetTagsQuerySchema = z.intersection(GetManySchema, TagFilterSchema);

type GetTagsQuery = z.infer<typeof GetTagsQuerySchema>;

function registerTagAPI(
  instance: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  async function getTags(query: GetTagsQuery): Promise<TagPage> {
    const response = await instance.get(endpoints.get, {
      params: GetTagsQuerySchema.parse(query),
    });
    return response.data;
  }

  async function createTag({ name, key }: TagCreate): Promise<Tag> {
    const response = await instance.post(endpoints.create, {
      name,
      key,
    });
    return TagSchema.parse(response.data);
  }

  return { get: getTags, create: createTag };
}

export {
  registerTagAPI,
  TagCreateSchema,
  TagSchema,
  type Tag,
  type TagCreate,
  TagFilterSchema,
  type TagFilter,
  TagPageSchema,
  type TagPage,
};
