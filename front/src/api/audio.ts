import { z } from "zod";

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

export type Interval = z.infer<typeof IntervalSchema>;

export const ResamplingParametersSchema = z.object({
  resample: z.boolean().default(false),
  samplerate: z.number().positive().int().optional(),
});

export type ResamplingParameters = z.input<typeof ResamplingParametersSchema>;

export const FilteringParametersSchema = z
  .object({
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

export type FilteringParameters = z.input<typeof FilteringParametersSchema>;

export const AudioParametersSchema = ResamplingParametersSchema.and(
  FilteringParametersSchema,
);

export type AudioParameters = z.input<typeof AudioParametersSchema>;

const DEFAULT_AUDIO_PARAMETERS: AudioParameters = {
  resample: false,
};

export function registerAudioApi({
  endpoints = DEFAULT_ENDPOINTS,
  baseUrl = "",
}: {
  endpoints?: typeof DEFAULT_ENDPOINTS;
  baseUrl?: string;
}) {
  function getStreamUrl({
    recording_id,
    speed = 1,
  }: {
    recording_id: number;
    speed?: number;
  }) {
    // Get url
    return `${baseUrl}${endpoints.stream}?recording_id=${recording_id}&speed=${speed}`;
  }

  function getDownloadUrl({
    recording_id,
    segment,
    parameters = DEFAULT_AUDIO_PARAMETERS,
  }: {
    recording_id: number;
    segment: Interval;
    parameters?: AudioParameters;
  }) {
    // Validate parameters
    const parsed_params = AudioParametersSchema.parse(parameters);
    const parsed_segment = IntervalSchema.parse(segment);

    // Construct query
    const query = {
      recording_id: recording_id,
      start_time: parsed_segment.min,
      end_time: parsed_segment.max,
      ...parsed_params,
    };

    const params = new URLSearchParams(
      Object.fromEntries(
        Object.entries(query).map(([key, value]) => [key, value.toString()]),
      ),
    );

    // Get url
    return `${baseUrl}${endpoints.download}?${params}`;
  }

  return {
    getDownloadUrl,
    getStreamUrl,
  };
}
