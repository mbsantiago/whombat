import { z } from "zod";
import { UserSchema } from "./users";
import { GeometrySchema } from "./geometries";
import { SoundEventSchema } from "./sound_events";
import { NoteSchema, NoteAssociationSchema } from "./notes";
import { TagSchema, TagAssociationSchema } from "./tags";

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
