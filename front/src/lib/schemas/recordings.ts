import { z } from "zod";

import { UserSchema } from "./users";
import { TagSchema, TagAssociationSchema } from "./tags";
import { FeatureSchema } from "./features";
import { NoteSchema, NoteAssociationSchema } from "./notes";
import { TimeStringSchema } from "./common";

export const FileStateSchema = z.enum([
  "missing",
  "registered",
  "unregistered",
]);

export const RecordingSchema = z.object({
  uuid: z.string().uuid(),
  path: z.string(),
  hash: z.string(),
  duration: z.number(),
  channels: z.number().int(),
  samplerate: z.number().int(),
  time_expansion: z.number().default(1),
  date: z.coerce.date().nullish(),
  time: TimeStringSchema.nullish(),
  latitude: z.number().nullish(),
  longitude: z.number().nullish(),
  rights: z.string().nullish(),
  tags: z.array(TagSchema).optional(),
  features: z.array(FeatureSchema).optional(),
  notes: z.array(NoteSchema).optional(),
  owners: z.array(UserSchema).optional(),
  created_on: z.coerce.date(),
});

export const RecordingTagSchema = TagAssociationSchema.extend({
  recording_uuid: z.string().uuid(),
});

export const RecordingNoteSchema = NoteAssociationSchema.extend({
  recording_uuid: z.string().uuid(),
});

export const RecordingStateSchema = z.object({
  path: z.string(),
  state: FileStateSchema,
});
