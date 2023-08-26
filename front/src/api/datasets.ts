import { z } from "zod";
import { AxiosInstance } from "axios";
import { GetManySchema, Page } from "./common";

const DEFAULT_ENDPOINTS = {
  get: "/api/v1/datasets/",
  create: "/api/v1/datasets/",
};

const DatasetFilterSchema = z.object({
  search: z.string().optional(),
});

const DatasetSchema = z.object({
  id: z.number().int(),
  uuid: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  recording_count: z.number().int(),
  created_at: z.coerce.date(),
});

const DatasetCreateSchema = z.object({
  uuid: z.string().uuid().optional(),
  name: z.string().min(1),
  audio_dir: z.string(),
  description: z.string().optional(),
});

type DatasetFilter = z.infer<typeof DatasetFilterSchema>;

type DatasetCreate = z.infer<typeof DatasetCreateSchema>;

type Dataset = z.infer<typeof DatasetSchema>;

const DatasetPageSchema = Page(DatasetSchema);

type DatasetPage = z.infer<typeof DatasetPageSchema>;

const GetDatasetsQuerySchema = z.intersection(
  GetManySchema,
  DatasetFilterSchema,
);

function registerDatasetAPI(
  instance: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  async function getMany(
    query: z.infer<typeof GetDatasetsQuerySchema> = {},
  ): Promise<DatasetPage> {
    const params = GetDatasetsQuerySchema.parse(query);
    const { data } = await instance.get(endpoints.get, { params });
    return DatasetPageSchema.parse(data);
  }

  async function create(data: DatasetCreate): Promise<Dataset> {
    const body = DatasetCreateSchema.parse(data);
    const { data: res } = await instance.post(endpoints.create, body);
    return DatasetSchema.parse(res);
  }

  return {
    getMany,
    create,
  };
}

export {
  registerDatasetAPI,
  DatasetSchema,
  DatasetPageSchema,
  DatasetCreateSchema,
  GetDatasetsQuerySchema,
  type Dataset,
  type DatasetPage,
  type DatasetCreate,
  type DatasetFilter,
};
