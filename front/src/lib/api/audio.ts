import { DEFAULT_AUDIO_SETTINGS } from "@/lib/constants";
import * as schemas from "@/lib/schemas";
import type * as types from "@/lib/types";

const DEFAULT_ENDPOINTS = {
  download: "/api/v1/audio/download/",
  stream: "/api/v1/audio/stream/",
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
    recording: types.Recording;
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
    parameters = DEFAULT_AUDIO_SETTINGS,
  }: {
    recording: types.Recording;
    segment?: types.Interval;
    parameters?: types.AudioSettings;
  }) {
    // Validate parameters
    const parsed_params = schemas.AudioSettingsSchema.parse(parameters);

    if (segment != null) {
      segment = schemas.IntervalSchema.parse(segment);
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
