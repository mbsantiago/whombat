import { AxiosInstance } from "axios";
import { z } from "zod";

import * as schemas from "@/lib/schemas";
import type * as types from "@/lib/types";

import { GetMany, Page, downloadContent } from "./common";

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
}: {
  instance: AxiosInstance;
  endpoints?: typeof DEFAULT_ENDPOINTS;
}) {
  async function getMany(
    query: types.GetManyQuery & types.DatasetFilter,
  ): Promise<types.Paginated<types.Dataset>> {
    const params = GetMany(schemas.DatasetFilterSchema).parse(query);
    const { data } = await instance.get(endpoints.getMany, { params });
    return Page(schemas.DatasetSchema).parse(data);
  }

  async function create(data: types.DatasetCreate): Promise<types.Dataset> {
    const body = schemas.DatasetCreateSchema.parse(data);
    const { data: res } = await instance.post(endpoints.create, body);
    return schemas.DatasetSchema.parse(res);
  }

  async function get(uuid: string): Promise<types.Dataset> {
    const { data } = await instance.get(endpoints.get, {
      params: { dataset_uuid: uuid },
    });
    return schemas.DatasetSchema.parse(data);
  }

  async function getDatasetState(
    uuid: string,
  ): Promise<types.RecordingState[]> {
    const { data } = await instance.get(endpoints.state, {
      params: { dataset_uuid: uuid },
    });
    return z.array(schemas.RecordingStateSchema).parse(data);
  }

  async function updateDataset(
    dataset: types.Dataset,
    data: types.DatasetUpdate,
  ): Promise<types.Dataset> {
    const body = schemas.DatasetUpdateSchema.parse(data);
    const { data: res } = await instance.patch(endpoints.update, body, {
      params: { dataset_uuid: dataset.uuid },
    });
    return schemas.DatasetSchema.parse(res);
  }

  async function deleteDataset(dataset: types.Dataset): Promise<types.Dataset> {
    const { data } = await instance.delete(endpoints.delete, {
      params: { dataset_uuid: dataset.uuid },
    });
    return schemas.DatasetSchema.parse(data);
  }

  async function downloadDatasetJSON(uuid: string) {
    const { data } = await instance.get(endpoints.downloadJson, {
      params: { dataset_uuid: uuid },
    });
    downloadContent(
      JSON.stringify(data),
      `dataset-${uuid}.json`,
      "application/json",
    );
  }

  async function downloadDatasetCSV(uuid: string) {
    const { data } = await instance.get(endpoints.downloadCsv, {
      params: { dataset_uuid: uuid },
    });
    downloadContent(data, `dataset-${uuid}.csv`, "text/csv");
  }

  async function downloadDataset(uuid: string, format: "json" | "csv") {
    switch (format) {
      case "json":
        return downloadDatasetJSON(uuid);
      case "csv":
        return downloadDatasetCSV(uuid);
      default:
        throw new Error(`Invalid format ${format}`);
    }
  }

  async function importDataset(
    data: types.DatasetImport,
  ): Promise<types.Dataset> {
    const formData = new FormData();
    const file = data.dataset[0];
    formData.append("dataset", file);
    formData.append("audio_dir", data.audio_dir);
    const { data: res } = await instance.post(endpoints.import, formData);
    return schemas.DatasetSchema.parse(res);
  }

  return {
    getMany,
    create,
    get,
    getState: getDatasetState,
    update: updateDataset,
    delete: deleteDataset,
    download: downloadDataset,
    import: importDataset,
  } as const;
}
