import { z } from "zod";

import * as schemas from "@/lib/schemas";

export type Note = z.infer<typeof schemas.NoteSchema>;

export type NoteCreate = z.infer<typeof schemas.NoteCreateSchema>;

export type NoteUpdate = z.input<typeof schemas.NoteUpdateSchema>;

export type NoteFilter = z.infer<typeof schemas.NoteFilterSchema>;
