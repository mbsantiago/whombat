// Purpose: Common types and constants for the API.
import axios from "axios";
import { z } from "zod";

const HOST = "";
const BASE_ROUTE = `/api/v1`;

const instance = axios.create({
  withCredentials: true,
  baseURL: HOST,
});

const GetManySchema = z.object({
  limit: z.number().int().gte(-1).optional(),
  offset: z.number().int().gte(0).optional(),
  sort_by: z.string().optional(),
});

type GetManyQuery = z.infer<typeof GetManySchema>;

type Paginated<T> = {
  items: T[];
  total: number;
  limit: number;
  offset: number;
};

const Page = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    items: z.array(schema),
    total: z.number().int(),
    limit: z.number().int(),
    offset: z.number().int(),
  });

export {
  instance,
  HOST,
  BASE_ROUTE,
  GetManySchema,
  type GetManyQuery,
  Page,
  type Paginated,
};
