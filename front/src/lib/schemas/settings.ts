import {
  DEFAULT_CMAP,
  DEFAULT_FILTER_ORDER,
  DEFAULT_OVERLAP,
  DEFAULT_SCALE,
  DEFAULT_WINDOW,
  DEFAULT_WINDOW_SIZE,
  MAX_SAMPLERATE,
  MIN_DB,
  MIN_SAMPLERATE,
} from "@/lib/constants";
import { z } from "zod";

export const AudioSettingsSchema = z
  .object({
    resample: z.boolean().default(false),
    samplerate: z.coerce
      .number()
      .positive()
      .int()
      .gte(MIN_SAMPLERATE)
      .lte(MAX_SAMPLERATE)
      .nullish(),
    channel: z.coerce.number().nonnegative().int().default(0),
    low_freq: z.coerce.number().nonnegative().nullish(),
    high_freq: z.coerce.number().nonnegative().nullish(),
    filter_order: z.coerce
      .number()
      .positive()
      .int()
      .default(DEFAULT_FILTER_ORDER),
    speed: z.coerce.number().positive().default(1),
  })
  .refine(
    // check that low_freq and high_freq are in the correct order
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
    // check that if samplerate is defined that low_freq is less
    // than nyquist frequency
    (data) => {
      if (data.samplerate == null || data.low_freq == null || !data.resample)
        return true;
      return data.low_freq <= data.samplerate / 2;
    },
    {
      message: "low_freq must be less than half the samplerate",
      path: ["low_freq"],
    },
  )
  .refine(
    // check that if samplerate is defined that high_freq is less
    // than nyquist frequency
    (data) => {
      if (data.samplerate == null || data.high_freq == null || !data.resample)
        return true;
      return data.high_freq <= data.samplerate / 2;
    },
    {
      message: "high_freq must be less than half the samplerate",
      path: ["high_freq"],
    },
  );

export const SCALES = ["amplitude", "power", "dB"] as const;
export const WINDOWS = [
  "boxcar",
  "triang",
  "bartlett",
  "flattop",
  "parzen",
  "bohman",
  "blackman",
  "blackmanharris",
  "nuttall",
  "barthann",
  "hamming",
  "hann",
  "kaiser",
] as const;
export const COLORMAPS = [
  "gray",
  "viridis",
  "magma",
  "inferno",
  "plasma",
  "cividis",
  "cool",
  "cubehelix",
  "twilight",
] as const;

export const SpectrogramSettingsSchema = z.object({
  window_size: z.coerce.number().positive().default(DEFAULT_WINDOW_SIZE),
  overlap: z.coerce.number().positive().gt(0).lte(1).default(DEFAULT_OVERLAP),
  window: z.enum(WINDOWS).default(DEFAULT_WINDOW),
  scale: z.enum(SCALES).default(DEFAULT_SCALE),
  clamp: z.boolean().default(true),
  min_dB: z.coerce.number().nonpositive().gte(MIN_DB).default(-80),
  max_dB: z.coerce.number().nonpositive().gte(MIN_DB).default(0),
  normalize: z.boolean().default(false),
  pcen: z.boolean().default(false),
  cmap: z.enum(COLORMAPS).default(DEFAULT_CMAP),
});

export const SpectrogramParametersSchema = z
  .object({
    resample: z.boolean().default(false),
    samplerate: z.coerce
      .number()
      .positive()
      .int()
      .gte(MIN_SAMPLERATE)
      .lte(MAX_SAMPLERATE)
      .nullish(),
    low_freq: z.coerce.number().positive().nullish(),
    high_freq: z.coerce.number().positive().nullish(),
    filter_order: z.coerce
      .number()
      .positive()
      .int()
      .default(DEFAULT_FILTER_ORDER),
    window_size: z.coerce.number().positive().default(DEFAULT_WINDOW_SIZE),
    overlap: z.coerce.number().positive().gt(0).lte(1).default(DEFAULT_OVERLAP),
    window: z.string().default(DEFAULT_WINDOW),
    scale: z.enum(["amplitude", "power", "dB"]).default(DEFAULT_SCALE),
    clamp: z.boolean().default(true),
    min_dB: z.coerce.number().nonpositive().gte(MIN_DB).default(-80),
    max_dB: z.coerce.number().nonpositive().gte(MIN_DB).default(0),
    normalize: z.boolean().default(false),
    channel: z.coerce.number().nonnegative().int().default(0),
    pcen: z.boolean().default(false),
    cmap: z.string().default(DEFAULT_CMAP),
  })
  .refine(
    (data) => {
      if (data.low_freq == null || data.high_freq == null) return true;
      return data.low_freq <= data.high_freq;
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
