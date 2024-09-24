import { z } from "zod";

import * as schemas from "@/lib/schemas";

export type UserRun = z.infer<typeof schemas.UserRunSchema>;

export type UserRunFilter = z.infer<typeof schemas.UserRunFilterSchema>;
