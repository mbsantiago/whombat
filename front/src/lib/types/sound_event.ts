import { z } from "zod";

import * as schemas from "@/lib/schemas";

export type SoundEvent = z.infer<typeof schemas.SoundEventSchema>;

export type SoundEventCreate = z.infer<typeof schemas.SoundEventCreateSchema>;

export type SoundEventUpdate = z.infer<typeof schemas.SoundEventUpdateSchema>;

export type SoundEventFilter = z.infer<typeof schemas.SoundEventFilterSchema>;
