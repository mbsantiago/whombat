import { z } from "zod";

export const ModelRunSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  version: z.string(),
  description: z.string().nullish(),
  created_on: z.coerce.date(),
});
