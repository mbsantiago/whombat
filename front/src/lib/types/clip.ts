import { z } from "zod";

import * as schemas from "@/lib/schemas";

export type Clip = z.infer<typeof schemas.ClipSchema>;

export type ClipCreate = z.input<typeof schemas.ClipCreateSchema>;

export type ClipCreateMany = z.input<typeof schemas.ClipCreateManySchema>;

export type ClipFilter = z.infer<typeof schemas.ClipFilterSchema>;
