import RecordingActions from "./RecordingActions";
import RecordingHeader from "./RecordingHeader";
import RecordingMap from "./RecordingMap";
import RecordingMediaInfo from "./RecordingMediaInfo";
import RecordingNotes from "./RecordingNotes";
import RecordingTagBar from "./RecordingTagBar";
import TagSearchBarBase, {
  type TagSearchBarProps,
} from "@/lib/components/tags/TagSearchBar";

import type { NoteCreate, NoteUpdate } from "@/lib/api/notes";
import { getTagColor, type Color } from "@/lib/utils/tags";
import { type FC } from "react";

import type {
  Note,
  Tag,
  Recording,
  SpectrogramParameters,
  User,
} from "@/lib/types";

export default function RecordingDetail({
  recording,
  currentUser,
  children,
  downloadUrl,
  onDelete,
  onRecordingUpdate,
  onRecordingClick,
  onTagAdd,
  onTagClick,
  onTagRemove,
  onNoteCreate,
  onNoteUpdate,
  onNoteDelete,
  colorFn = getTagColor,
  TagSearchBar = TagSearchBarBase,
}: {
  recording: Recording;
  currentUser?: User;
  parameters?: SpectrogramParameters;
  downloadUrl?: string;
  onDelete?: () => void;
  onRecordingUpdate?: (data: Partial<Recording>) => void;
  onRecordingClick?: () => void;
  onTagAdd?: (tag: Tag) => void;
  onTagClick?: (tag: Tag) => void;
  onTagRemove?: (tag: Tag) => void;
  colorFn?: (tag: Tag) => Color;
  onNoteCreate?: (note: NoteCreate) => void;
  onNoteUpdate?: (note: Note, data: NoteUpdate) => void;
  onNoteDelete?: (note: Note) => void;
  children?: React.ReactNode;
  TagSearchBar?: FC<TagSearchBarProps>;
}) {
  return (
    <div className="flex flex-col gap-4 pb-4">
      <RecordingHeader
        recording={recording}
        onRecordingUpdate={onRecordingUpdate}
        onRecordingClick={onRecordingClick}
      />
      <div className="flex flex-row flex-wrap gap-8 justify-between lg:flex-nowrap w-100">
        <div className="grow">
          <div className="grid grid-cols-2 gap-8">
            <div className="col-span-2">
              <RecordingTagBar
                tags={recording.tags ?? []}
                onSelectTag={onTagAdd}
                onClickTag={onTagClick}
                onDeleteTag={onTagRemove}
                colorFn={colorFn}
                TagSearchBar={TagSearchBar}
              />
            </div>
            <div className="col-span-2">{children}</div>
            <div className="col-span-2">
              <RecordingNotes
                notes={recording.notes ?? []}
                currentUser={currentUser}
                onNoteCreate={onNoteCreate}
                onNoteUpdate={onNoteUpdate}
                onNoteDelete={onNoteDelete}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col flex-none gap-4 max-w-sm">
          <RecordingActions downloadURL={downloadUrl} onDelete={onDelete} />
          <RecordingMediaInfo
            duration={recording.duration}
            samplerate={recording.samplerate}
            channels={recording.channels}
            time_expansion={recording.time_expansion}
          />
          <RecordingMap
            latitude={recording.latitude}
            longitude={recording.longitude}
          />
        </div>
      </div>
    </div>
  );
}
