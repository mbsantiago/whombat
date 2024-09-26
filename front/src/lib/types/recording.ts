import { z } from "zod";

import * as schemas from "@/lib/schemas";

export type Recording = z.infer<typeof schemas.RecordingSchema>;

export type RecordingFilter = z.input<typeof schemas.RecordingFilterSchema>;

export type RecordingUpdate = z.input<typeof schemas.RecordingUpdateSchema>;

export type RecordingTag = z.infer<typeof schemas.RecordingTagSchema>;

export type RecordingTagFilter = z.infer<
  typeof schemas.RecordingTagFilterSchema
>;

export type RecordingNote = z.infer<typeof schemas.RecordingNoteSchema>;

export type RecordingNoteFilter = z.infer<
  typeof schemas.RecordingNoteFilterSchema
>;

export type FileState = z.infer<typeof schemas.FileStateSchema>;

export type RecordingState = z.infer<typeof schemas.RecordingStateSchema>;
