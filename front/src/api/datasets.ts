import { z } from "zod";
import { AxiosInstance } from "axios";

import { GetManySchema, Page } from "./common";
import { DatasetSchema, type Dataset } from "./schemas";

export const DatasetFilterSchema = z.object({
  search: z.string().optional(),
});

export type DatasetFilter = z.input<typeof DatasetFilterSchema>;

export const DatasetCreateSchema = z.object({
  uuid: z.string().uuid().optional(),
  name: z.string().min(1),
  audio_dir: z.string(),
  description: z.string().optional(),
});

export type DatasetCreate = z.input<typeof DatasetCreateSchema>;

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

export type GetDatasetsQuery = z.infer<typeof GetDatasetsQuerySchema>;

const DEFAULT_ENDPOINTS = {
  getMany: "/api/v1/datasets/",
  create: "/api/v1/datasets/",
  get: "/api/v1/datasets/detail/",
  update: "/api/v1/datasets/detail/",
  delete: "/api/v1/datasets/detail/",
  download: "/api/v1/datasets/detail/download/",
  import: "/api/v1/datasets/import/",
};

export function registerDatasetAPI({
  instance,
  endpoints = DEFAULT_ENDPOINTS,
  baseUrl = "",
}: {
  instance: AxiosInstance;
  endpoints?: typeof DEFAULT_ENDPOINTS;
  baseUrl?: string;
}) {
  async function getMany(query: GetDatasetsQuery): Promise<DatasetPage> {
    const params = GetDatasetsQuerySchema.parse(query);
    const { data } = await instance.get(endpoints.getMany, { params });
    return DatasetPageSchema.parse(data);
  }

  async function create(data: DatasetCreate): Promise<Dataset> {
    const body = DatasetCreateSchema.parse(data);
    const { data: res } = await instance.post(endpoints.create, body);
    return DatasetSchema.parse(res);
  }

  async function get(dataset_uuid: string): Promise<Dataset> {
    const { data } = await instance.get(endpoints.get, {
      params: { dataset_uuid },
    });
    return DatasetSchema.parse(data);
  }

  async function updateDataset(
    dataset: Dataset,
    data: DatasetUpdate,
  ): Promise<Dataset> {
    const body = DatasetUpdateSchema.parse(data);
    const { data: res } = await instance.patch(endpoints.update, body, {
      params: { dataset_uuid: dataset.uuid },
    });
    return DatasetSchema.parse(res);
  }

  async function deleteDataset(dataset_id: number): Promise<Dataset> {
    const { data } = await instance.delete(endpoints.delete, {
      params: { dataset_id },
    });
    return DatasetSchema.parse(data);
  }

  function getDownloadUrl(dataset_id: number): string {
    return `${baseUrl}${endpoints.download}?dataset_id=${dataset_id}`;
  }

  async function importDataset(data: FormData) {
    const { data: res } = await instance.post(endpoints.import, data);
    return DatasetSchema.parse(res);
  }

  return {
    getMany,
    create,
    get,
    update: updateDataset,
    delete: deleteDataset,
    getDownloadUrl,
    import: importDataset,
  };
}
