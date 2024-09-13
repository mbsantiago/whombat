// Purpose: Common types and constants for the API.
import axios from "axios";
import { z } from "zod";

export const HOST = "http://localhost:5000";
export const BASE_ROUTE = `/api/v1`;

export const instance = axios.create({
  withCredentials: true,
  baseURL: HOST,
});

export const GetManySchema = z.object({
  limit: z.number().int().gte(-1).optional(),
  offset: z.number().int().gte(0).optional(),
  sort_by: z.string().optional(),
});

export type GetManyQuery = z.infer<typeof GetManySchema>;

export type Paginated<T> = {
  items: T[];
  total: number;
  limit: number;
  offset: number;
};

export const Page = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    items: z.array(schema),
    total: z.number().int(),
    limit: z.number().int(),
    offset: z.number().int(),
  });

export function downloadContent(data: any, filename: string, filetype: string) {
  const href = URL.createObjectURL(new Blob([data], { type: filetype }));

  const link = document.createElement("a");
  link.href = href;
  link.setAttribute("download", filename);
  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(href);
}
