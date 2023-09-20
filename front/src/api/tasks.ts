import { z } from "zod";
import { AxiosInstance } from "axios";

import { ClipCreateSchema } from "@/api/clips";
import { TagSchema } from "@/api/tags";
import { SimpleUserSchema } from "@/api/user";
import { NoteSchema, type NoteUpdate, NoteUpdateSchema } from "@/api/notes";

import { GetManySchema, Page } from "./common";

export const StatusBadgeCreateSchema = z.object({
  task_id: z.number(),
  state: z.enum(["assigned", "completed", "verified", "rejected"]),
});

export type StatusBadgeCreate = z.infer<typeof StatusBadgeCreateSchema>;

export const StatusBadgeSchema = z.object({
  id: z.number(),
  state: z.enum(["assigned", "completed", "verified", "rejected"]),
  user: SimpleUserSchema,
});

export type StatusBadge = z.infer<typeof StatusBadgeSchema>;

export const TaskCreateSchema = z.object({
  clip_id: z.number(),
  project_id: z.number(),
});

export type TaskCreate = z.infer<typeof TaskCreateSchema>;

export const TaskSchema = z.object({
  id: z.number(),
  clip: ClipCreateSchema,
  tags: z.array(TagSchema),
  status_badges: z.array(StatusBadgeSchema),
  notes: z.array(NoteSchema),
});

export type Task = z.infer<typeof TaskSchema>;

export const TaskPageSchema = Page(TaskSchema);

export type TaskPage = z.infer<typeof TaskPageSchema>;

export const TaskFilterSchema = z.object({
  dataset__eq: z.number().optional(),
  dataset__isin: z.array(z.number()).optional(),
  project__eq: z.number().optional(),
  project__isin: z.array(z.number()).optional(),
});

export type TaskFilter = z.infer<typeof TaskFilterSchema>;

export const GetTasksSchema = z.intersection(GetManySchema, TaskFilterSchema);

export type GetTasks = z.infer<typeof GetTasksSchema>;

export const TaskNoteSchema = z.object({
  task_id: z.number().int(),
  note_id: z.number().int(),
  note: NoteSchema,
});

export type TaskNote = z.infer<typeof TaskNoteSchema>;

export const TaskNoteFilter = z.object({
  note__eq: z.number().int().optional(),
  created_by__eq: z.string().uuid().optional(),
  project__eq: z.number().int().optional(),
  task_eq: z.number().int().optional(),
  is_issue__eq: z.boolean().optional(),
  message__eq: z.string().optional(),
  message__has: z.string().optional(),
  created_at__before: z.coerce.date().optional(),
  created_at__after: z.coerce.date().optional(),
});

export type TaskNoteFilter = z.infer<typeof TaskNoteFilter>;

export const TaskNotePageSchema = Page(TaskNoteSchema);

export type TaskNotePage = z.infer<typeof TaskNotePageSchema>;

export const GetTaskNotesQuerySchema = z.intersection(
  GetManySchema,
  TaskNoteFilter,
);

export type GetTaskNotesQuery = z.infer<typeof GetTaskNotesQuerySchema>;

export const TaskTagSchema = z.object({
  task_id: z.number().int(),
  tag_id: z.number().int(),
  tag: TagSchema,
});

export type TaskTag = z.infer<typeof TaskTagSchema>;

export const TaskTagFilter = z.object({
  task__eq: z.number().int().optional(),
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

export type TaskTagFilter = z.infer<typeof TaskTagFilter>;

export const TaskTagPageSchema = Page(TaskTagSchema);

export type TaskTagPage = z.infer<typeof TaskTagPageSchema>;

export const GetTaskTagsQuerySchema = z.intersection(
  GetManySchema,
  TaskTagFilter,
);

export type GetTaskTagsQuery = z.infer<typeof GetTaskTagsQuerySchema>;

const DEFAULT_ENDPOINTS = {
  createMany: "/api/v1/tasks/",
  getMany: "/api/v1/tasks/",
  get: "/api/v1/tasks/detail/",
  delete: "/api/v1/tasks/detail/",
  addNote: "/api/v1/tasks/detail/notes/",
  updateNote: "/api/v1/tasks/detail/notes/",
  removeNote: "/api/v1/tasks/detail/notes/",
  addTag: "/api/v1/tasks/detail/tags/",
  removeTag: "/api/v1/tasks/detail/tags/",
  getNotes: "/api/v1/tasks/notes/",
  getTags: "/api/v1/tasks/tags/",
};

export function registerTasksApi(
  instance: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  async function createMany(data: TaskCreate[]): Promise<Task[]> {
    const body = z.array(TaskCreateSchema).parse(data);
    const response = await instance.post(endpoints.createMany, body);
    return z.array(TaskSchema).parse(response.data);
  }

  async function getMany(query: GetTasks): Promise<TaskPage> {
    const params = GetTasksSchema.parse(query);
    const response = await instance.get(endpoints.getMany, { params });
    return TaskPageSchema.parse(response.data);
  }

  async function get(task_id: number): Promise<Task> {
    const params = { task_id };
    const response = await instance.get(endpoints.get, { params });
    return TaskSchema.parse(response.data);
  }

  async function delete_(task_id: number): Promise<Task> {
    const params = { task_id };
    const response = await instance.delete(endpoints.delete, { params });
    return TaskSchema.parse(response.data);
  }

  async function addNote({
    task_id,
    message,
    is_issue,
  }: {
    task_id: number;
    message: string;
    is_issue: boolean;
  }): Promise<Task> {
    const response = await instance.post(
      endpoints.addNote,
      {
        message,
        is_issue,
      },
      {
        params: {
          task_id,
        },
      },
    );
    return TaskSchema.parse(response.data);
  }

  async function updateNote({
    task_id,
    note_id,
    data,
  }: {
    task_id: number;
    note_id: number;
    data: NoteUpdate;
  }) {
    const body = NoteUpdateSchema.parse(data);
    const response = await instance.patch(endpoints.updateNote, body, {
      params: {
        task_id,
        note_id,
      },
    });
    return TaskSchema.parse(response.data);
  }

  async function removeNote({
    task_id,
    note_id,
  }: {
    task_id: number;
    note_id: number;
  }) {
    const response = await instance.delete(endpoints.removeNote, {
      params: {
        task_id,
        note_id,
      },
    });
    return TaskSchema.parse(response.data);
  }

  async function addTag({
    task_id,
    tag_id,
  }: {
    task_id: number;
    tag_id: number;
  }) {
    const response = await instance.post(
      endpoints.addTag,
      {},
      {
        params: {
          task_id,
          tag_id,
        },
      },
    );
    return TaskSchema.parse(response.data);
  }

  async function removeTag({
    task_id,
    tag_id,
  }: {
    task_id: number;
    tag_id: number;
  }) {
    const response = await instance.delete(endpoints.removeTag, {
      params: {
        task_id,
        tag_id,
      },
    });
    return TaskSchema.parse(response.data);
  }

  async function getNotes(query: GetTaskNotesQuery) {
    const params = GetTaskNotesQuerySchema.parse(query);
    const { data } = await instance.get(endpoints.getNotes, { params });
    return TaskNotePageSchema.parse(data);
  }

  async function getTags(query: GetTaskTagsQuery) {
    const params = GetTaskTagsQuerySchema.parse(query);
    const { data } = await instance.get(endpoints.getTags, { params });
    return TaskTagPageSchema.parse(data);
  }

  return {
    createMany,
    getMany,
    get,
    delete: delete_,
    getNotes,
    getTags,
    addNote,
    updateNote,
    removeNote,
    addTag,
    removeTag,
  };
}
