import { z } from "zod";
import { UserSchema } from "./users";

export const TagSchema = z.object({
  key: z.string(),
  value: z.string(),
});

export const PredictionTagSchema = z.object({
  tag: TagSchema,
  score: z.number(),
  created_on: z.coerce.date(),
});

export const TagAssociationSchema = z.object({
  tag: TagSchema,
  created_by: UserSchema.nullish(),
  created_on: z.coerce.date(),
});
