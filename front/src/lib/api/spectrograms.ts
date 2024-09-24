import * as schemas from "@/lib/schemas";
import type * as types from "@/lib/types";

const DEFAULT_ENDPOINTS = {
  get: "/api/v1/spectrograms/",
};

export function registerSpectrogramAPI({
  endpoints = DEFAULT_ENDPOINTS,
  baseUrl = "",
}: {
  endpoints?: typeof DEFAULT_ENDPOINTS;
  baseUrl?: string;
}) {
  function getUrl({
    uuid,
    interval,
    ...rest
  }: {
    uuid: string;
    interval: types.Interval;
  } & types.SpectrogramParameters) {
    const parsed_params = schemas.SpectrogramParametersSchema.parse(rest);
    const parsed_segment = schemas.IntervalSchema.parse(interval);

    const query = {
      recording_uuid: uuid,
      start_time: parsed_segment.min,
      end_time: parsed_segment.max,
      ...parsed_params,
    };

    const params = new URLSearchParams(
      Object.fromEntries(
        Object.entries(query)
          .filter(([_, value]) => value != null)
          .map(([key, value]) => [key, (value as any).toString()]),
      ),
    );

    // Get url
    return `${baseUrl}${endpoints.get}?${params}`;
  }

  return {
    getUrl,
  };
}
