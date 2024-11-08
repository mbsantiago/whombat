// Purpose: Common types and constants for the API.
import axios from "axios";
import { z } from "zod";

import { GetManySchema } from "@/lib/schemas";

export const HOST = `${process.env.NEXT_PUBLIC_BACKEND_HOST}`;
export const BASE_ROUTE = `/api/v1`;

export const instance = axios.create({
  withCredentials: true,
  baseURL: HOST,
});

export const Page = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    items: z.array(schema),
    total: z.number().int(),
    limit: z.number().int(),
    offset: z.number().int(),
  });

export const GetMany = <T extends z.ZodTypeAny>(schema: T) =>
  z.intersection(GetManySchema, schema);

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
