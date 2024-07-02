import { z } from "zod";

import type { Recording } from "@/lib/types";

const DEFAULT_ENDPOINTS = {
  download: "/api/v1/audio/download/",
  stream: "/api/v1/audio/stream/",
};

export const IntervalSchema = z
  .object({
    min: z.number(),
    max: z.number(),
  })
  .refine((data) => data.min < data.max, {
    message: "min must be less than max",
    path: ["min"],
  });

export type Interval = z.input<typeof IntervalSchema>;

export const AudioParametersSchema = z
  .object({
    resample: z.boolean().default(false),
    samplerate: z.number().positive().int().optional(),
    low_freq: z.number().positive().optional(),
    high_freq: z.number().positive().optional(),
    filter_order: z.number().positive().int().default(5),
  })
  .refine(
    (data) => {
      if (data.low_freq == null || data.high_freq == null) return true;
      return data.low_freq < data.high_freq;
    },
    {
      message: "low_freq must be less than high_freq",
      path: ["low_freq"],
    },
  );

export type AudioParameters = z.input<typeof AudioParametersSchema>;

const DEFAULT_AUDIO_PARAMETERS: AudioParameters = {
  resample: false,
};

export function registerAudioAPI({
  endpoints = DEFAULT_ENDPOINTS,
  baseUrl = "",
}: {
  endpoints?: typeof DEFAULT_ENDPOINTS;
  baseUrl?: string;
}) {
  function getStreamUrl({
    recording,
    speed = 1,
    startTime,
    endTime,
  }: {
    recording: Recording;
    speed?: number;
    startTime?: number;
    endTime?: number;
  }) {
    // Get url
    const params: Record<string, string> = {
      recording_uuid: recording.uuid,
    };

    if (speed != null) {
      params["speed"] = speed.toString();
    }
    if (startTime != null) {
      params["start_time"] = startTime.toString();
    }
    if (endTime != null) {
      params["end_time"] = endTime.toString();
    }

    const urlparams = new URLSearchParams(params);
    return `${baseUrl}${endpoints.stream}?${urlparams}`;
  }

  function getDownloadUrl({
    recording,
    segment,
    parameters = DEFAULT_AUDIO_PARAMETERS,
  }: {
    recording: Recording;
    segment?: Interval;
    parameters?: AudioParameters;
  }) {
    // Validate parameters
    const parsed_params = AudioParametersSchema.parse(parameters);

    if (segment != null) {
      segment = IntervalSchema.parse(segment);
    }

    // Construct query
    const query = {
      recording_uuid: recording.uuid,
      start_time: segment?.min,
      end_time: segment?.max,
      ...parsed_params,
    };

    const params = new URLSearchParams(
      Object.fromEntries(
        Object.entries(query)
          .filter(([_, value]) => value != null)
          .map(([key, value]) => [key, value?.toString() || ""]),
      ),
    );

    // Get url
    return `${baseUrl}${endpoints.download}?${params}`;
  }

  return {
    getDownloadUrl,
    getStreamUrl,
  } as const;
}
