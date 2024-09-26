import type { ClipCreateMany, Recording } from "@/lib/types";
import { getRandomSubarray } from "@/lib/utils/arrays";

export type ClipExtraction = {
  subsampleRecordings: boolean;
  maxRecordings: number;
  clip: boolean;
  clipLength: number;
  clipOverlap: number;
  subsampleClips: boolean;
  maxClipsPerRecording: number;
};

export function computeClips({
  recordings,
  config,
}: {
  recordings: Recording[];
  config: ClipExtraction;
}): ClipCreateMany {
  let clips: ClipCreateMany = [];

  const recordingSample = getRandomSubarray(
    recordings,
    config.subsampleRecordings ? config.maxRecordings : recordings.length,
  );

  for (let recording of recordingSample) {
    if (!config.clip) {
      // Add whole recording as a clip
      clips.push([
        recording.uuid,
        {
          start_time: 0,
          end_time: recording.duration,
        },
      ]);
      continue;
    }

    // Compute all recording clips of the given length
    let recordingClips: ClipCreateMany = [];

    // Compute total number of clips
    let totalClips = Math.ceil(
      recording.duration / (config.clipLength - config.clipOverlap),
    );
    for (let i = 0; i < totalClips; i++) {
      // Compute start and end time
      let start_time = i * (config.clipLength - config.clipOverlap);
      let end_time = start_time + config.clipLength;
      recordingClips.push([
        recording.uuid,
        {
          start_time,
          end_time,
        },
      ]);
    }

    if (!config.subsampleClips) {
      // add all clips
      clips.push(...recordingClips);
      continue;
    }

    // subsample clips
    let subsampledclips: ClipCreateMany = getRandomSubarray(
      recordingClips,
      config.maxClipsPerRecording,
    );
    clips.push(...subsampledclips);
  }

  return clips;
}
