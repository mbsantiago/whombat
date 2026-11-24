import { z } from "zod";

import * as schemas from "@/lib/schemas";

export type Dataset = z.infer<typeof schemas.DatasetSchema>;

export type DatasetFilter = z.input<typeof schemas.DatasetFilterSchema>;

export type DatasetCreate = z.input<typeof schemas.DatasetCreateSchema>;

export type DatasetCreateResult = z.infer<
  typeof schemas.DatasetCreateResultSchema
>;

export type DatasetUpdate = z.input<typeof schemas.DatasetUpdateSchema>;

export type DatasetImport = z.infer<typeof schemas.DatasetImportSchema>;

export type DatasetDirectory = z.infer<typeof schemas.DatasetDirectorySchema>;

export type DatasetDirectoryBrowse = z.infer<
  typeof schemas.DatasetDirectoryBrowseSchema
>;
