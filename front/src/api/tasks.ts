import { z } from "zod";
import { AxiosInstance } from "axios";
import { GetManySchema, Page } from "./common";
import { ClipCreateSchema } from "@/api/clips";
import { TagSchema } from "@/api/tags";
import { SimpleUserSchema } from "@/api/user";
import { NoteSchema } from "@/api/notes";

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

const DEFAULT_ENDPOINTS = {
  createMany: "/api/v1/tasks/",
  getMany: "/api/v1/tasks/",
  get: "/api/v1/tasks/detail",
  delete: "/api/v1/tasks/detail",
};

export function registerTasksApi(
  api: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  async function createMany(data: TaskCreate[]): Promise<Task[]> {
    const body = z.array(TaskCreateSchema).parse(data);
    const response = await api.post(endpoints.createMany, body);
    return response.data;
  }

  async function getMany(query: GetTasks): Promise<TaskPage> {
    const params = GetTasksSchema.parse(query);
    const response = await api.get(endpoints.getMany, { params });
    return TaskPageSchema.parse(response.data);
  }

  async function get(task_id: number): Promise<Task> {
    const params = { task_id };
    const response = await api.get(endpoints.get, { params });
    return TaskSchema.parse(response.data);
  }

  async function delete_(task_id: number): Promise<Task> {
    const params = { task_id };
    const response = await api.delete(endpoints.delete, { params });
    return TaskSchema.parse(response.data);
  }

  return {
    createMany,
    getMany,
    get,
    delete: delete_,
  };
}
