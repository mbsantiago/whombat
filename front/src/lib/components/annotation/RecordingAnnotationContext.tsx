import { RecordingIcon } from "@/lib/components/icons";
import Link from "@/lib/components/ui/Link";
import RecordingDate from "@/lib/components/recordings/RecordingDate";
import {
  getBaseName,
  removeExtension,
} from "@/lib/components/recordings/RecordingHeader";
import RecordingLocation from "@/lib/components/recordings/RecordingLocation";
import RecordingTagBar from "@/lib/components/recordings/RecordingTagBar";
import RecordingTime from "@/lib/components/recordings/RecordingTime";

import type { Recording, Tag } from "@/lib/types";

export default function RecordingAnnotationContext({
  recording,
  onTagClick,
}: {
  recording: Recording;
  onTagClick?: (tag: Tag) => void;
}) {
  const { path } = recording;
  const baseName = removeExtension(getBaseName(path) ?? "");

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row justify-start gap-8 items-center">
        <div className="inline-flex items-center text-stone-500">
          <RecordingIcon className="inline-block mr-1 w-5 h-5 text-stone-600" />
          <Link
            mode="text"
            padding="p-0"
            variant="secondary"
            href={`/recordings/detail/?recording_uuid=${recording.uuid}`}
            className="max-w-xl whitespace-nowrap"
          >
            {baseName}
            <span className="text-sm text-stone-600">.WAV</span>
          </Link>
        </div>
        <RecordingLocation
          latitude={recording.latitude}
          longitude={recording.longitude}
          disabled
        />
        <RecordingTime time={recording.time} disabled />
        <RecordingDate date={recording.date} disabled />
        <div className="text-stone-500 text-sm">
          <span className="font-semibold">SR</span>{" "}
          {recording.samplerate.toLocaleString()} Hz
        </div>
        <div className="text-stone-500 text-sm">
          <span className="font-semibold">C</span>{" "}
          {recording.channels.toLocaleString()}
        </div>
        <div className="text-stone-500 text-sm">
          <span className="font-semibold">TE</span>{" "}
          {recording.time_expansion.toLocaleString()}
        </div>
      </div>
      <RecordingTagBar
        label="Recording Tags"
        recording={recording}
        onTagClick={onTagClick}
        disabled
      />
    </div>
  );
}
