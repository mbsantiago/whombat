import { z } from "zod";

import { SimpleUserSchema } from "@/api/user";

const NoteSchema = z.object({
  id: z.number().int(),
  message: z.string(),
  is_issue: z.boolean(),
  created_at: z.coerce.date(),
  created_by: SimpleUserSchema,
});

export { NoteSchema };
