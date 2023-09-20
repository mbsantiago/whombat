import { z } from "zod";
import { AxiosInstance } from "axios";
import { GetManySchema, Page } from "./common";
import { TagSchema } from "@/api/tags";
import { SimpleUserSchema } from "@/api/user";
import { NoteSchema } from "@/api/notes";
import { SoundEventSchema, GeometrySchema } from "@/api/sound_events";

export const AnnotationCreateSchema = z.object({
  task_id: z.number(),
  geometry: GeometrySchema,
});

export type AnnotationCreate = z.infer<typeof AnnotationCreateSchema>;

export const AnnotationUpdateSchema = z.object({
  geometry: GeometrySchema,
});

export type AnnotationUpdate = z.infer<typeof AnnotationUpdateSchema>;

export const AnnotationSchema = z.object({
  id: z.number(),
  uuid: z.string().uuid(),
  task_id: z.number(),
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
  update: "/api/v1/annotations/detail/",
  addTag: "/api/v1/annotations/detail/tags/",
  removeTag: "/api/v1/annotations/detail/tags/",
  addNote: "/api/v1/annotations/detail/notes/",
  updateNote: "/api/v1/annotations/detail/notes/",
  removeNote: "/api/v1/annotations/detail/notes/",
  delete: "/api/v1/annotations/detail/",
  getNotes: "/api/v1/annotations/notes/",
  getTags: "/api/v1/annotations/tags/",
};

export function registerAnnotationsApi(
  instance: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  async function create(data: AnnotationCreate): Promise<Annotation> {
    const body = AnnotationCreateSchema.parse(data);
    const response = await instance.post(endpoints.create, body);
    return AnnotationSchema.parse(response.data);
  }

  async function getMany(query: GetAnnotations): Promise<AnnotationPage> {
    const params = GetAnnotationsSchema.parse(query);
    const response = await instance.get(endpoints.getMany, { params });
    return AnnotationPageSchema.parse(response.data);
  }

  async function get(annotation_id: number): Promise<Annotation> {
    const params = { annotation_id };
    const response = await instance.get(endpoints.get, { params });
    return AnnotationSchema.parse(response.data);
  }

  async function update(
    annotation_id: number,
    data: AnnotationUpdate,
  ): Promise<Annotation> {
    const body = AnnotationUpdateSchema.parse(data);
    const response = await instance.patch(endpoints.update, body, {
      params: { annotation_id },
    });
    return AnnotationSchema.parse(response.data);
  }

  async function addTag(
    annotation_id: number,
    tag_id: number,
  ): Promise<Annotation> {
    const body = { tag_id };
    const response = await instance.post(endpoints.addTag, body, {
      params: { annotation_id },
    });
    return AnnotationSchema.parse(response.data);
  }

  async function removeTag(
    annotation_id: number,
    tag_id: number,
  ): Promise<Annotation> {
    const response = await instance.delete(endpoints.removeTag, {
      params: { annotation_id, tag_id },
    });
    return AnnotationSchema.parse(response.data);
  }

  async function addNote(
    annotation_id: number,
    message: string,
    is_issue: boolean = false,
  ): Promise<Annotation> {
    const body = { message, is_issue };
    const response = await instance.post(endpoints.addNote, body, {
      params: { annotation_id},
    });
    return AnnotationSchema.parse(response.data);
  }

  async function updateNote(
    annotation_id: number,
    note_id: number,
    message: string,
    is_issue: boolean = false,
  ): Promise<Annotation> {
    const body = { message, is_issue };
    const response = await instance.patch(endpoints.updateNote, body, {
      params: { annotation_id, note_id },
    });
    return AnnotationSchema.parse(response.data);
  }

  async function removeNote(
    annotation_id: number,
    note_id: number,
  ): Promise<Annotation> {
    const response = await instance.delete(endpoints.removeNote, {
      params: { annotation_id, note_id },
    });
    return AnnotationSchema.parse(response.data);
  }

  async function delete_(annotation_id: number): Promise<Annotation> {
    const params = { annotation_id };
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
    update,
    addTag,
    removeTag,
    addNote,
    updateNote,
    removeNote,
    delete: delete_,
    getNotes,
    getTags,
  };
}
