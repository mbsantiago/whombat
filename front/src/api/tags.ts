import { z } from "zod";
import { AxiosInstance } from "axios";
import { type GetManyQuery, GetManySchema } from "./common";

const TagCreateSchema = z.object({
  name: z.string(),
  key: z.string(),
});

type TagCreate = z.infer<typeof TagCreateSchema>;

const TagSchema = TagCreateSchema.extend({
  id: z.number(),
});

type Tag = z.infer<typeof TagSchema>;

const DEFAULT_ENDPOINTS = {
  get: "/api/v1/tags",
  create: "/api/v1/tags",
};

function registerTagAPI(
  instance: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  async function getTags(query: GetManyQuery) {
    const response = await instance.get(endpoints.get, {
      params: GetManySchema.parse(query),
    });
    return response.data;
  }

  async function createTag({ name, key }: TagCreate) {
    const response = await instance.post(endpoints.create, {
      name,
      key,
    });
    return TagSchema.parse(response.data);
  }

  return { get: getTags, create: createTag };
}

export { registerTagAPI, TagCreateSchema, TagSchema, type Tag, type TagCreate };
