import { z } from "zod";
import { UserSchema } from "./users";
import { ClipSchema } from "./clips";
import { NoteSchema, NoteAssociationSchema } from "./notes";
import { TagSchema, TagAssociationSchema } from "./tags";
import { SoundEventAnnotationSchema } from "./sound_event_annotations";

export const ClipAnnotationSchema = z.object({
  uuid: z.string().uuid(),
  clip: ClipSchema,
  created_by: UserSchema.nullish(),
  notes: z.array(NoteSchema).nullish(),
  tags: z.array(TagSchema).nullish(),
  sound_events: z.array(SoundEventAnnotationSchema).nullish(),
  created_on: z.coerce.date(),
});

export const ClipAnnotationTagSchema = TagAssociationSchema.extend({
  clip_annotation_uuid: z.string().uuid(),
});

export const ClipAnnotationNoteSchema = NoteAssociationSchema.extend({
  clip_annotation_uuid: z.string().uuid(),
});
