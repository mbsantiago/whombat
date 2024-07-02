import {
  DEFAULT_CMAP,
  DEFAULT_FILTER_ORDER,
  DEFAULT_OVERLAP,
  DEFAULT_SCALE,
  DEFAULT_WINDOW,
  DEFAULT_WINDOW_SIZE,
  MIN_DB,
} from "@/lib/constants";
import { IntervalSchema, SpectrogramParametersSchema } from "@/lib/schemas";

import type { Interval, Recording, SpectrogramParameters } from "@/lib/types";

const DEFAULT_ENDPOINTS = {
  get: "/api/v1/spectrograms/",
};

export const DEFAULT_SPECTROGRAM_PARAMETERS: SpectrogramParameters = {
  resample: false,
  scale: DEFAULT_SCALE,
  pcen: false,
  window_size: DEFAULT_WINDOW_SIZE,
  overlap: DEFAULT_OVERLAP,
  cmap: DEFAULT_CMAP,
  window: DEFAULT_WINDOW,
  filter_order: DEFAULT_FILTER_ORDER,
  normalize: false,
  clamp: true,
  min_dB: MIN_DB,
  max_dB: 0,
  channel: 0,
};

export function registerSpectrogramAPI({
  endpoints = DEFAULT_ENDPOINTS,
  baseUrl = "",
}: {
  endpoints?: typeof DEFAULT_ENDPOINTS;
  baseUrl?: string;
}) {
  function getUrl({
    recording,
    interval,
    ...rest
  }: {
    recording: Recording;
    interval: Interval;
  } & SpectrogramParameters) {
    const parsed_params = SpectrogramParametersSchema.parse(rest);
    const parsed_segment = IntervalSchema.parse(interval);

    const query = {
      recording_uuid: recording.uuid,
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
