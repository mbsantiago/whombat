import { z } from "zod";
import { AxiosInstance } from "axios";

import { GetManySchema, Page } from "./common";

const DEFAULT_ENDPOINTS = {
  getMany: "/api/v1/datasets/",
  create: "/api/v1/datasets/",
  get: "/api/v1/datasets/detail/",
  update: "/api/v1/datasets/detail/",
  delete: "/api/v1/datasets/detail/",
  download: "/api/v1/datasets/detail/download/",
  import: "/api/v1/datasets/import/",
};

export const DatasetFilterSchema = z.object({
  search: z.string().optional(),
});

export type DatasetFilter = z.infer<typeof DatasetFilterSchema>;

export const DatasetSchema = z.object({
  id: z.number().int(),
  uuid: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  audio_dir: z.string(),
  recording_count: z.number().int(),
  created_at: z.coerce.date(),
});

export type Dataset = z.infer<typeof DatasetSchema>;

export const DatasetCreateSchema = z.object({
  uuid: z.string().uuid().optional(),
  name: z.string().min(1),
  audio_dir: z.string(),
  description: z.string().optional(),
});

export type DatasetCreate = z.infer<typeof DatasetCreateSchema>;

export const DatasetUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

export type DatasetUpdate = z.infer<typeof DatasetUpdateSchema>;

export const DatasetPageSchema = Page(DatasetSchema);

export type DatasetPage = z.infer<typeof DatasetPageSchema>;

export const GetDatasetsQuerySchema = z.intersection(
  GetManySchema,
  DatasetFilterSchema,
);

export function registerDatasetAPI({
  instance,
  endpoints = DEFAULT_ENDPOINTS,
  baseUrl = "",
}: {
  instance: AxiosInstance;
  endpoints?: typeof DEFAULT_ENDPOINTS;
  baseUrl?: string;
}) {
  async function getMany(
    query: z.infer<typeof GetDatasetsQuerySchema> = {},
  ): Promise<DatasetPage> {
    const params = GetDatasetsQuerySchema.parse(query);
    const { data } = await instance.get(endpoints.getMany, { params });
    return DatasetPageSchema.parse(data);
  }

  async function create(data: DatasetCreate): Promise<Dataset> {
    const body = DatasetCreateSchema.parse(data);
    const { data: res } = await instance.post(endpoints.create, body);
    return DatasetSchema.parse(res);
  }

  async function get(dataset_id: number): Promise<Dataset> {
    const { data } = await instance.get(endpoints.get, {
      params: { dataset_id },
    });
    return DatasetSchema.parse(data);
  }

  async function update(
    dataset_id: number,
    data: DatasetUpdate,
  ): Promise<Dataset> {
    const body = DatasetUpdateSchema.parse(data);
    const { data: res } = await instance.patch(endpoints.update, body, {
      params: { dataset_id },
    });
    return DatasetSchema.parse(res);
  }

  async function delete_(dataset_id: number): Promise<Dataset> {
    const { data } = await instance.delete(endpoints.delete, {
      params: { dataset_id },
    });
    return DatasetSchema.parse(data);
  }

  function getDownloadUrl(dataset_id: number): string {
    return `${baseUrl}${endpoints.download}?dataset_id=${dataset_id}`;
  }

  function importDataset(data: FormData): Promise<Dataset> {
    return instance.post(endpoints.import, data);
  }

  return {
    getMany,
    create,
    get,
    update,
    delete: delete_,
    getDownloadUrl,
    import: importDataset,
  };
}
