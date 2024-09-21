import { z } from "zod";

import { GeometrySchema } from "./geometries";
import { NoteAssociationSchema, NoteSchema } from "./notes";
import { SoundEventSchema } from "./sound_events";
import { TagAssociationSchema, TagSchema } from "./tags";
import { UserSchema } from "./users";

export const SoundEventAnnotationSchema = z.object({
  uuid: z.string().uuid(),
  sound_event: SoundEventSchema,
  created_by: UserSchema.nullish(),
  notes: z.array(NoteSchema).nullish(),
  tags: z.array(TagSchema).nullish(),
  created_on: z.coerce.date(),
});

export const SoundEventAnnotationCreateSchema = z.object({
  geometry: GeometrySchema,
  tags: z.array(TagSchema).optional(),
});

export const SoundEventAnnotationUpdateSchema = z.object({
  geometry: GeometrySchema,
});

export const SoundEventAnnotationTagSchema = TagAssociationSchema.extend({
  sound_event_annotation_uuid: z.string().uuid(),
});

export const SoundEventAnnotationNoteSchema = NoteAssociationSchema.extend({
  sound_event_annotation_uuid: z.string().uuid(),
});
