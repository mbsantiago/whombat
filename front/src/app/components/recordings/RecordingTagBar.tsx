import RecordingTagBarBase from "@/lib/components/recordings/RecordingTagBar";
import TagSearchBar from "@/app/components/tags/TagSearchBar";
import Loading from "@/app/loading";
import Error from "@/app/error";
import useRecording from "@/app/hooks/api/useRecording";

import type { TagFilter } from "@/lib/api/tags";
import type { ComponentProps } from "react";
import type { Recording, Tag } from "@/lib/types";

/**
 * RecordingTagBar component is responsible for displaying and managing tags
 * associated with a recording. It uses the useRecording hook to fetch and
 * manage the tags.
 */
export default function RecordingTagBar({
  recording,
  onAddRecordingTag,
  onDeleteRecordingTag,
  tagFilter,
  ...props
}: {
  /** The recording object. */
  recording: Recording;
  /** Optional callback function to handle adding a tag to the recording. */
  onAddRecordingTag?: (recording: Recording, tag: Tag) => void;
  /** Optional callback function to handle deleting a tag from the recording. */
  onDeleteRecordingTag?: (recording: Recording, tag: Tag) => void;
  /** Optional filter to apply to the TagSearchBar component. */
  tagFilter?: TagFilter;
} & Omit<
  ComponentProps<typeof RecordingTagBarBase>,
  "TagSearchBar" | "onSelectTag" | "onDeleteTag" | "tags"
>) {
  const { data, isLoading, error, addTag, removeTag } = useRecording({
    uuid: recording.uuid,
    recording,
    onAddRecordingTag,
    onDeleteRecordingTag,
  });

  if (isLoading) {
    return <Loading />;
  }

  if (data == null) {
    return <Error error={error || undefined} />;
  }

  return (
    <RecordingTagBarBase
      tags={data.tags}
      onSelectTag={addTag.mutate}
      onDeleteTag={removeTag.mutate}
      TagSearchBar={(props) => <TagSearchBar filter={tagFilter} {...props} />}
      {...props}
    />
  );
}
