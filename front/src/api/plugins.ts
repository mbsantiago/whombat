import { AxiosInstance } from "axios";
import { z } from "zod";

export const PluginSchema = z.object({
  name: z.string(),
  version: z.string().optional(),
  attribution: z.string().optional(),
  thumbnail: z.string().optional(),
  description: z.string(),
  url: z.string(),
});

export type Plugin = z.infer<typeof PluginSchema>;

const DEFAULT_ENDPOINTS = {
  list: "/api/v1/plugins/list/",
};

export function registerPluginsAPI(
  instance: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  async function getPlugins(): Promise<Plugin[]> {
    const { data } = await instance.get(endpoints.list);
    return data;
  }

  return {
    get: getPlugins,
  };
}
