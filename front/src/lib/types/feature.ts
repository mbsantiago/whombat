import { z } from "zod";

import * as schemas from "@/lib/schemas";

export type Feature = z.infer<typeof schemas.FeatureSchema>;

export type FeatureFilter = z.input<typeof schemas.FeatureFilterSchema>;
