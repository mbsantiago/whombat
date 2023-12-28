import { AxiosInstance } from "axios";
import { z } from "zod";

import { DatasetSchema, RecordingStateSchema } from "@/schemas";

import { GetManySchema, Page } from "./common";

import type { Dataset, RecordingState } from "@/types";

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

export type DatasetUpdate = z.input<typeof DatasetUpdateSchema>;

export const DatasetPageSchema = Page(DatasetSchema);

export type DatasetPage = z.infer<typeof DatasetPageSchema>;

export const GetDatasetsQuerySchema = z.intersection(
  GetManySchema,
  DatasetFilterSchema,
);

export type GetDatasetsQuery = z.input<typeof GetDatasetsQuerySchema>;

const DEFAULT_ENDPOINTS = {
  getMany: "/api/v1/datasets/",
  create: "/api/v1/datasets/",
  state: "/api/v1/datasets/detail/state/",
  get: "/api/v1/datasets/detail/",
  update: "/api/v1/datasets/detail/",
  delete: "/api/v1/datasets/detail/",
  downloadJson: "/api/v1/datasets/detail/download/json/",
  downloadCsv: "/api/v1/datasets/detail/download/csv/",
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

  async function get(uuid: string): Promise<Dataset> {
    const { data } = await instance.get(endpoints.get, {
      params: { dataset_uuid: uuid },
    });
    return DatasetSchema.parse(data);
  }

  async function getDatasetState(uuid: string): Promise<RecordingState[]> {
    const { data } = await instance.get(endpoints.state, {
      params: { dataset_uuid: uuid },
    });
    return z.array(RecordingStateSchema).parse(data);
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

  async function deleteDataset(dataset: Dataset): Promise<Dataset> {
    const { data } = await instance.delete(endpoints.delete, {
      params: { dataset_uuid: dataset.uuid },
    });
    return DatasetSchema.parse(data);
  }

  function getDownloadUrl(dataset: Dataset, format: "json" | "csv"): string {
    if (format === "json") {
      return `${baseUrl}${endpoints.downloadJson}?dataset_uuid=${dataset.uuid}`;
    } else {
      return `${baseUrl}${endpoints.downloadCsv}?dataset_uuid=${dataset.uuid}`;
    }
  }

  async function importDataset(data: FormData): Promise<Dataset> {
    const { data: res } = await instance.post(endpoints.import, data);
    return DatasetSchema.parse(res);
  }

  return {
    getMany,
    create,
    get,
    getState: getDatasetState,
    update: updateDataset,
    delete: deleteDataset,
    getDownloadUrl,
    import: importDataset,
  } as const;
}
