import { RecordingIcon } from "@/lib/components/icons";
import Button from "@/lib/components/ui/Button";
import RecordingDate from "@/lib/components/recordings/RecordingDate";
import {
  getBaseName,
  removeExtension,
} from "@/lib/components/recordings/RecordingHeader";
import RecordingLocation from "@/lib/components/recordings/RecordingLocation";
import RecordingTagBar from "@/lib/components/recordings/RecordingTagBar";
import RecordingTime from "@/lib/components/recordings/RecordingTime";

import type { Recording, Tag } from "@/lib/types";

/**
 * AnnotationContext component displays contextual info for annotators.
 *
 * The main context info is any info about the recording being annotated.
 * This includes the recording name, location, time, date, sample rate,
 * and any tags associated with the recording.
 */
export default function AnnotationContext({
  recording,
  onTagClick,
  onClickRecording,
}: {
  /** The recording object containing details such as path, uuid, latitude,
   * longitude, time, date, samplerate, channels, time_expansion, and tags.
   */
  recording: Recording;
  /** Optional callback function to handle tag click events. */
  onTagClick?: (tag: Tag) => void;
  /** Optional callback function to handle recording click events. */
  onClickRecording?: () => void;
}) {
  const { path } = recording;
  const baseName = removeExtension(getBaseName(path) ?? "");

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-8 justify-start items-center">
        <div className="inline-flex items-center text-stone-500">
          <RecordingIcon className="inline-block mr-1 w-5 h-5 text-stone-600" />
          <Button
            mode="text"
            padding="p-0"
            variant="secondary"
            onClick={onClickRecording}
            className="max-w-xl whitespace-nowrap"
          >
            {baseName}
            <span className="text-sm text-stone-600">.WAV</span>
          </Button>
        </div>
        <RecordingLocation
          latitude={recording.latitude}
          longitude={recording.longitude}
          disabled
        />
        <RecordingTime time={recording.time} disabled />
        <RecordingDate date={recording.date} disabled />
        <div className="text-sm text-stone-500">
          <span className="font-semibold">SR</span>{" "}
          {recording.samplerate.toLocaleString()} Hz
        </div>
        <div className="text-sm text-stone-500">
          <span className="font-semibold">C</span>{" "}
          {recording.channels.toLocaleString()}
        </div>
        <div className="text-sm text-stone-500">
          <span className="font-semibold">TE</span>{" "}
          {recording.time_expansion.toLocaleString()}
        </div>
      </div>
      <RecordingTagBar
        label="Recording Tags"
        tags={recording.tags ?? []}
        onClickTag={onTagClick}
        disabled
      />
    </div>
  );
}
