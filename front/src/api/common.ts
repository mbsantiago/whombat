// Purpose: Common types and constants for the API.
import axios from "axios";
import { z } from "zod";

const HOST = "http://localhost:5000";
const BASE_ROUTE = `/api/v1`;

const instance = axios.create({
  withCredentials: true,
  baseURL: HOST,
});

const GetManySchema = z.object({
  limit: z.number().gt(0).optional(),
  offset: z.number().gt(0).optional(),
});

type GetManyQuery = z.infer<typeof GetManySchema>;

export { instance, HOST, BASE_ROUTE, GetManySchema, type GetManyQuery };
