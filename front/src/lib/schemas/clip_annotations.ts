import { z } from "zod";

import { ClipSchema } from "./clips";
import { NoteAssociationSchema, NoteSchema } from "./notes";
import { SoundEventAnnotationSchema } from "./sound_event_annotations";
import { TagAssociationSchema, TagSchema } from "./tags";
import { UserSchema } from "./users";

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
