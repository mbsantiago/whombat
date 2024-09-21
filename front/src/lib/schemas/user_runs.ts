import { z } from "zod";

import { UserSchema } from "./users";

export const UserRunSchema = z.object({
  uuid: z.string().uuid(),
  user: UserSchema,
  created_on: z.coerce.date(),
});
