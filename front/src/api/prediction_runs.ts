import { z } from "zod";
import { AxiosInstance } from "axios";

import { GetManySchema, Page } from "@/api/common";
import { NoteSchema } from "@/api/notes";
import { SimpleUserSchema } from "@/api/user";

const DEFAULT_ENDPOINTS = {
  getMany: "/api/v1/prediction_runs/",
  create: "/api/v1/prediction_runs/",
  get: "/api/v1/prediction_runs/detail/",
  update: "/api/v1/prediction_runs/detail/",
  delete: "/api/v1/prediction_runs/detail/",
  addNote: "/api/v1/prediction_run/detail/notes/",
  updateNote: "/api/v1/prediction_run/detail/notes/",
  removeNote: "/api/v1/prediction_run/detail/notes/",
};

export const EvaluationMetricSchema = z.object({
  id: z.number(),
  name: z.string(),
  value: z.number(),
});

export type EvaluationMetric = z.infer<typeof EvaluationMetricSchema>;

export const EvaluationSchema = z.object({
  id: z.number(),
  prediction_run_id: z.number(),
  score: z.number(),
  metrics: z.array(EvaluationMetricSchema),
});

export type Evaluation = z.infer<typeof EvaluationSchema>;

export const PredictionRunCreateSchema = z.object({
  evaluation_set_id: z.number(),
  user_id: z.string().uuid().optional(),
  model_name: z.string().optional(),
  model_version: z.string().optional(),
});

export type PredictionRunCreate = z.infer<typeof PredictionRunCreateSchema>;

export const PredictionRunSchema = PredictionRunCreateSchema.extend({
  id: z.number(),
  uuid: z.string().uuid(),
  evaluation: EvaluationSchema.optional(),
  user: SimpleUserSchema.optional(),
  notes: z.array(NoteSchema),
});

export type PredictionRun = z.infer<typeof PredictionRunSchema>;

export const PredictionRunUpdateSchema = z.object({
  model_name: z.string().optional(),
  model_version: z.string().optional(),
});

export type PredictionRunUpdate = z.infer<typeof PredictionRunUpdateSchema>;

export const PredictionRunFilterSchema = z.object({
  evaluation_set__eq: z.number().optional(),
  user__eq: z.string().uuid().optional(),
  model_name__eq: z.string().optional(),
  model_name__has: z.string().optional(),
  is_model__eq: z.boolean().optional(),
  created_at__before: z.coerce.date().optional(),
  created_at__after: z.coerce.date().optional(),
  created_at__on: z.coerce.date().optional(),
  evaluated__eq: z.boolean().optional(),
  score__lt: z.number().optional(),
  score__gt: z.number().optional(),
});

export type PredictionRunFilter = z.infer<typeof PredictionRunFilterSchema>;

export const PredictionRunPageSchema = Page(PredictionRunSchema);

export type PredictionRunPage = z.infer<typeof PredictionRunPageSchema>;

export const PredictionRunGetManySchema = z.intersection(
  GetManySchema,
  PredictionRunFilterSchema,
);

export type PredictionRunGetMany = z.infer<typeof PredictionRunGetManySchema>;

export function registerPredictionRunAPI(
  instance: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  async function get(prediction_run_id: number) {
    const response = await instance.get(endpoints.get, {
      params: {
        prediction_run_id,
      },
    });
    return PredictionRunSchema.parse(response.data);
  }

  async function getMany(params: PredictionRunGetMany = {}) {
    const response = await instance.get(endpoints.getMany, {
      params,
    });
    return PredictionRunPageSchema.parse(response.data);
  }

  async function create(data: PredictionRunCreate) {
    const response = await instance.post(endpoints.create, data);
    return PredictionRunSchema.parse(response.data);
  }

  async function update(prediction_run_id: number, data: PredictionRunUpdate) {
    const response = await instance.patch(endpoints.update, data, {
      params: {
        prediction_run_id,
      },
    });
    return PredictionRunSchema.parse(response.data);
  }

  async function delete_(prediction_run_id: number) {
    const response = await instance.delete(endpoints.delete, {
      params: {
        prediction_run_id,
      },
    });
    return PredictionRunSchema.parse(response.data);
  }

  async function addNote(
    prediction_run_id: number,
    message: string,
    is_issue: boolean,
  ) {
    const response = await instance.post(
      endpoints.addNote,
      {
        message,
        is_issue,
      },
      {
        params: {
          prediction_run_id,
        },
      },
    );
    return PredictionRunSchema.parse(response.data);
  }

  async function updateNote(
    prediction_run_id: number,
    note_id: number,
    message: string,
    is_issue: boolean,
  ) {
    const response = await instance.patch(
      endpoints.updateNote,
      {
        message,
        is_issue,
      },
      {
        params: {
          prediction_run_id,
          note_id,
        },
      },
    );
    return PredictionRunSchema.parse(response.data);
  }

  async function removeNote(
    prediction_run_id: number,
    note_id: number,
  ) {
    const response = await instance.delete(
      endpoints.removeNote,
      {
        params: {
          prediction_run_id,
          note_id,
        },
      },
    );
    return PredictionRunSchema.parse(response.data);
  }

  return {
    get,
    getMany,
    create,
    update,
    delete: delete_,
    addNote,
    updateNote,
    removeNote,
  };
}
