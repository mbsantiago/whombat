import { type Recording } from "@/api/schemas";
import { type ClipCreateMany } from "@/api/clips";
import { getRandomSubarray } from "@/utils/arrays";

export { getRandomSubarray };

export type ClipExtraction = {
  clip: boolean;
  clipLength: number;
  overlap: number;
  subsample: boolean;
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
  let {
    clipLength,
    clip: shouldClip,
    subsample,
    overlap,
    maxClipsPerRecording: maxClips,
  } = config;

  for (let recording of recordings) {
    if (!shouldClip) {
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
    let totalClips = Math.ceil(recording.duration / (clipLength - overlap));
    for (let i = 0; i < totalClips; i++) {
      // Compute start and end time
      let start_time = i * (clipLength - overlap);
      let end_time = start_time + clipLength;
      recordingClips.push([
        recording.uuid,
        {
          start_time,
          end_time,
        },
      ]);
    }

    if (!subsample) {
      // add all clips
      clips.push(...recordingClips);
      continue;
    }

    // subsample clips
    let subsampledclips: ClipCreateMany = getRandomSubarray(
      recordingClips,
      maxClips,
    );
    clips.push(...subsampledclips);
  }

  return clips;
}
