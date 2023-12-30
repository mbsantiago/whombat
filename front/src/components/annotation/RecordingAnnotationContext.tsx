import { RecordingIcon, TagIcon } from "@/components/icons";
import Link from "@/components/Link";
import RecordingDate from "@/components/recordings/RecordingDate";
import {
  getBaseName,
  removeExtension,
} from "@/components/recordings/RecordingHeader";
import RecordingLocation from "@/components/recordings/RecordingLocation";
import RecordingTagBar from "@/components/recordings/RecordingTagBar";
import RecordingTime from "@/components/recordings/RecordingTime";
import TagComponent from "@/components/tags/Tag";
import useStore from "@/store";

import type { Recording, Tag } from "@/types";

export default function RecordingAnnotationContext({
  recording,
  onTagClick,
}: {
  recording: Recording;
  onTagClick?: (tag: Tag) => void;
}) {
  const getTagColor = useStore((state) => state.getTagColor);
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
