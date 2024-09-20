import { z } from "zod";

export const UserSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  email: z.string().email().optional(),
  name: z.string().nullable().optional(),
});
