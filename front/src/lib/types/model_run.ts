import { z } from "zod";

import * as schemas from "@/lib/schemas";

export type ModelRun = z.infer<typeof schemas.ModelRunSchema>;

export type ModelRunFilter = z.input<typeof schemas.ModelRunFilterSchema>;

export type ModelRunUpdate = z.input<typeof schemas.ModelRunUpdateSchema>;

export type ModelRunImport = z.input<typeof schemas.ModelRunImportSchema>;
