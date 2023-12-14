import { z } from "zod";

import {
  AudioParametersSchema,
  type Interval,
  IntervalSchema,
} from "@/api/audio";

const DEFAULT_ENDPOINTS = {
  get: "/api/v1/spectrograms/",
};

export const MIN_DB = -140;

export const DEFAULT_WINDOW_SIZE = 0.025;

export const DEFAULT_HOP_SIZE = 0.01;

export const SpectrogramWindowSchema = z.object({
  time: IntervalSchema,
  freq: IntervalSchema,
});

export type SpectrogramWindow = z.infer<typeof SpectrogramWindowSchema>;

export const STFTParametersSchema = z
  .object({
    window_size: z.number().positive().default(DEFAULT_WINDOW_SIZE),
    hop_size: z.number().positive().default(DEFAULT_HOP_SIZE),
    window: z.string().default("hann"),
  })
  .refine(
    (data) => {
      return data.window_size > data.hop_size;
    },
    {
      message: "window_size must be greater than hop_size",
      path: ["window_size"],
    },
  );

export type STFTParameters = z.input<typeof STFTParametersSchema>;

export const AmplitudeParametersSchema = z
  .object({
    scale: z.enum(["amplitude", "power", "dB"]).default("dB"),
    clamp: z.boolean().default(true),
    min_dB: z.number().nonpositive().gte(MIN_DB).default(-80),
    max_dB: z.number().nonpositive().gte(MIN_DB).default(0),
    normalize: z.boolean().default(false),
  })
  .refine(
    (data) => {
      return data.min_dB < data.max_dB;
    },
    {
      message: "min_dB must be less than max_dB",
      path: ["min_dB"],
    },
  );

export type AmplitudeParameters = z.input<typeof AmplitudeParametersSchema>;

export const SpectrogramParametersSchema = AudioParametersSchema.and(
  STFTParametersSchema,
)
  .and(AmplitudeParametersSchema)
  .and(
    z.object({
      channel: z.number().nonnegative().int().default(0),
      pcen: z.boolean().default(false),
      cmap: z.string().default("grays"),
    }),
  );

export type SpectrogramParameters = z.input<typeof SpectrogramParametersSchema>;

const DEFAULT_CMAP: string = "gray";

export const DEFAULT_SPECTROGRAM_PARAMETERS: SpectrogramParameters = {
  resample: false,
  scale: "dB",
  pcen: false,
  cmap: DEFAULT_CMAP,
  normalize: false,
  clamp: true,
  min_dB: -80,
};

export function registerSpectrogramAPI({
  endpoints = DEFAULT_ENDPOINTS,
  baseUrl = "",
}: {
  endpoints?: typeof DEFAULT_ENDPOINTS;
  baseUrl?: string;
}) {
  function getUrl({
    recording_id,
    segment,
    parameters = DEFAULT_SPECTROGRAM_PARAMETERS,
  }: {
    recording_id: number;
    segment: Interval;
    parameters?: SpectrogramParameters;
  }) {
    // Validate parameters
    const parsed_params = SpectrogramParametersSchema.parse(parameters);
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
    return `${baseUrl}${endpoints.get}?${params}`;
  }

  return {
    getUrl,
  };
}
