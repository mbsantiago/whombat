import { z } from "zod";

import { type Interval, IntervalSchema } from "@/api/audio";
import { type Recording } from "@/api/schemas";

const DEFAULT_ENDPOINTS = {
  get: "/api/v1/spectrograms/",
};

export const MAX_SAMPLERATE = 500_000;
export const MIN_SAMPLERATE = 4000;
export const MIN_DB = -140;
export const DEFAULT_WINDOW_SIZE = 0.025;
export const DEFAULT_HOP_SIZE = 0.5;
export const DEFAULT_WINDOW = "hann";
export const DEFAULT_SCALE = "dB";
export const DEFAULT_FILTER_ORDER = 5;
export const DEFAULT_CMAP = "inferno";

export const SpectrogramWindowSchema = z.object({
  time: IntervalSchema,
  freq: IntervalSchema,
});

export type SpectrogramWindow = z.infer<typeof SpectrogramWindowSchema>;

export const SpectrogramParametersSchema = z
  .object({
    resample: z.boolean().default(false),
    samplerate: z.coerce
      .number()
      .positive()
      .int()
      .gte(MIN_SAMPLERATE)
      .lte(MAX_SAMPLERATE)
      .optional(),
    low_freq: z.coerce.number().positive().optional(),
    high_freq: z.coerce.number().positive().optional(),
    filter_order: z.coerce
      .number()
      .positive()
      .int()
      .default(DEFAULT_FILTER_ORDER),
    window_size: z.coerce.number().positive().default(DEFAULT_WINDOW_SIZE),
    hop_size: z.coerce
      .number()
      .positive()
      .gt(0)
      .lte(1)
      .default(DEFAULT_HOP_SIZE),
    window: z.string().default(DEFAULT_WINDOW),
    scale: z.enum(["amplitude", "power", "dB"]).default(DEFAULT_SCALE),
    clamp: z.boolean().default(true),
    min_dB: z.coerce.number().nonpositive().gte(MIN_DB).default(-80),
    max_dB: z.coerce.number().nonpositive().gte(MIN_DB).default(0),
    normalize: z.boolean().default(false),
    channel: z.coerce.number().nonnegative().int().default(0),
    pcen: z.boolean().default(false),
    cmap: z.string().default("grays"),
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
  )
  .refine(
    (data) => {
      return data.min_dB < data.max_dB;
    },
    {
      message: "min_dB must be less than max_dB",
      path: ["min_dB"],
    },
  );

export type SpectrogramParameters = z.infer<typeof SpectrogramParametersSchema>;

export const DEFAULT_SPECTROGRAM_PARAMETERS: SpectrogramParameters = {
  resample: false,
  scale: "dB",
  pcen: false,
  window_size: DEFAULT_WINDOW_SIZE,
  hop_size: DEFAULT_HOP_SIZE,
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
    segment,
    parameters = DEFAULT_SPECTROGRAM_PARAMETERS,
  }: {
    recording: Recording;
    segment: Interval;
    parameters?: SpectrogramParameters;
  }) {
    // Validate parameters
    const parsed_params = SpectrogramParametersSchema.parse(parameters);
    const parsed_segment = IntervalSchema.parse(segment);

    // Construct query
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
          .map(([key, value]) => [key, value.toString()]),
      ),
    );

    // Get url
    return `${baseUrl}${endpoints.get}?${params}`;
  }

  return {
    getUrl,
  };
}
