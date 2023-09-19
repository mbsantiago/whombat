import { z } from "zod";
import { AxiosInstance } from "axios";
import { GetManySchema, Page } from "./common";
import { TagSchema } from "@/api/tags";
import { SimpleUserSchema } from "@/api/user";
import { NoteSchema } from "@/api/notes";
import { SoundEventSchema } from "@/api/sound_events";

export const AnnotationCreateSchema = z.object({
  task_id: z.number(),
  sound_event_id: z.number(),
});

export type AnnotationCreate = z.infer<typeof AnnotationCreateSchema>;

export const AnnotationSchema = AnnotationCreateSchema.extend({
  created_by: SimpleUserSchema,
  sound_event: SoundEventSchema,
  notes: z.array(NoteSchema),
  tags: z.array(TagSchema),
});

export type Annotation = z.infer<typeof AnnotationSchema>;

export const AnnotationPageSchema = Page(AnnotationSchema);

export type AnnotationPage = z.infer<typeof AnnotationPageSchema>;

export const AnnotationFilterSchema = z.object({
  project__eq: z.number().optional(),
  task__eq: z.number().optional(),
  recording__eq: z.number().optional(),
  sound_event__eq: z.number().optional(),
  created_by__eq: z.string().optional(),
  tag__eq: z.string().optional(),
});

export type AnnotationFilter = z.infer<typeof AnnotationFilterSchema>;

export const GetAnnotationsSchema = z.intersection(
  GetManySchema,
  AnnotationFilterSchema,
);

export type GetAnnotations = z.infer<typeof GetAnnotationsSchema>;

export const AnnotationNoteSchema = z.object({
  annotation_id: z.number().int(),
  note_id: z.number().int(),
  note: NoteSchema,
});

export type AnnotationNote = z.infer<typeof AnnotationNoteSchema>;

export const AnnotationNoteFilterSchema = z.object({
  task__eq: z.number().optional(),
  created_by__eq: z.string().optional(),
  project__eq: z.number().optional(),
  recording__eq: z.number().optional(),
  is_issue__eq: z.boolean().optional(),
  message__eq: z.string().optional(),
  message__has: z.string().optional(),
  created_at__before: z.coerce.date().optional(),
  created_at__after: z.coerce.date().optional(),
});

export type AnnotationNoteFilter = z.infer<typeof AnnotationNoteFilterSchema>;

export const AnnotationNotePageSchema = Page(AnnotationNoteSchema);

export type AnnotationNotePage = z.infer<typeof AnnotationNotePageSchema>;

export const GetAnnotationNotesQuerySchema = z.intersection(
  GetManySchema,
  AnnotationNoteFilterSchema,
);

export type GetAnnotationNotesQuery = z.infer<
  typeof GetAnnotationNotesQuerySchema
>;

export const AnnotationTagSchema = z.object({
  task_id: z.number().int(),
  tag_id: z.number().int(),
  tag: TagSchema,
});

export type AnnotationTag = z.infer<typeof AnnotationTagSchema>;

export const AnnotationTagFilterSchema = z.object({
  task__eq: z.number().optional(),
  annotation__eq: z.number().optional(),
  recording__eq: z.number().int().optional(),
  tag__eq: z.number().int().optional(),
  created_at__before: z.coerce.date().optional(),
  created_at__after: z.coerce.date().optional(),
  project__eq: z.number().int().optional(),
  search: z.string().optional(),
  key__eq: z.string().optional(),
  key__has: z.string().optional(),
  value__eq: z.string().optional(),
  value__has: z.string().optional(),
});

export type AnnotationTagFilter = z.infer<typeof AnnotationTagFilterSchema>;

export const AnnotationTagPageSchema = Page(AnnotationTagSchema);

export type AnnotationTagPage = z.infer<typeof AnnotationTagPageSchema>;

export const GetAnnotationTagsQuerySchema = z.intersection(
  GetManySchema,
  AnnotationTagFilterSchema,
);

export type GetAnnotationTagsQuery = z.infer<
  typeof GetAnnotationTagsQuerySchema
>;

const DEFAULT_ENDPOINTS = {
  create: "/api/v1/annotations/",
  getMany: "/api/v1/annotations/",
  get: "/api/v1/annotations/detail/",
  delete: "/api/v1/annotations/detail/",
  getNotes: "/api/v1/annotations/notes/",
  getTags: "/api/v1/annotations/tags/",
};


export function registerAnnotationsApi(
  instance: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  async function create(data: AnnotationCreate): Promise<Annotation[]> {
    const body = z.array(AnnotationCreateSchema).parse(data);
    const response = await instance.post(endpoints.create, body);
    return z.array(AnnotationSchema).parse(response.data);
  }

  async function getMany(query: GetAnnotations): Promise<AnnotationPage> {
    const params = GetAnnotationsSchema.parse(query);
    const response = await instance.get(endpoints.getMany, { params });
    return AnnotationPageSchema.parse(response.data);
  }

  async function get(task_id: number): Promise<Annotation> {
    const params = { task_id };
    const response = await instance.get(endpoints.get, { params });
    return AnnotationSchema.parse(response.data);
  }

  async function delete_(task_id: number): Promise<Annotation> {
    const params = { task_id };
    const response = await instance.delete(endpoints.delete, { params });
    return AnnotationSchema.parse(response.data);
  }

  async function getNotes(query: GetAnnotationNotesQuery) {
    const params = GetAnnotationNotesQuerySchema.parse(query);
    const { data } = await instance.get(endpoints.getNotes, { params });
    return AnnotationNotePageSchema.parse(data);
  }

  async function getTags(query: GetAnnotationTagsQuery) {
    const params = GetAnnotationTagsQuerySchema.parse(query);
    const { data } = await instance.get(endpoints.getTags, { params });
    return AnnotationTagPageSchema.parse(data);
  }

  return {
    create,
    getMany,
    get,
    delete: delete_,
    getNotes,
    getTags,
  };
}
