import { useCallback } from "react";

import { DEFAULT_SPECTROGRAM_PARAMETERS } from "@/api/spectrograms";
import ClipAnnotationNotes from "@/components/clip_annotations/ClipAnnotationNotes";
import ClipAnnotationSpectrogram from "@/components/clip_annotations/ClipAnnotationSpectrogram";
import ClipAnnotationTags from "@/components/clip_annotations/ClipAnnotationTags";
import RecordingHeader from "@/components/recordings/RecordingHeader";
import RecordingTagBar from "@/components/recordings/RecordingTagBar";
import useClipAnnotation from "@/hooks/api/useClipAnnotation";

import type { TagFilter } from "@/api/tags";
import type {
  ClipAnnotation,
  SoundEventAnnotation,
  SpectrogramParameters,
  Tag,
  User,
} from "@/types";

export default function AnnotateClip({
  clipAnnotation,
  tagFilter,
  currentUser,
  parameters = DEFAULT_SPECTROGRAM_PARAMETERS,
  onParameterSave,
}: {
  /** The clip annotation to annotate. */
  clipAnnotation: ClipAnnotation;
  tagFilter: TagFilter;
  currentUser?: User;
  /** Spectrogram parameters to use. */
  parameters?: SpectrogramParameters;
  /** If provided this sound event annotation will be focused on mount. */
  soundEventAnnotation?: SoundEventAnnotation;
  /** Callback when a sound event annotation is created. */
  onCreateSoundEventAnnotation?: (annotation: SoundEventAnnotation) => void;
  /** Callback when a sound event annotation is updated. */
  onUpdateSoundEventAnnotation?: (annotation: SoundEventAnnotation) => void;
  /** Callback when a tag is added to a sound event annotation . */
  onAddSoundEventTag?: (annotation: SoundEventAnnotation, tag: Tag) => void;
  /** Callback when a tag is removed from a sound event annotation . */
  onRemoveSoundEventTag?: (annotation: SoundEventAnnotation, tag: Tag) => void;
  /** Callback when a sound event annotation is deleted. */
  onDeleteSoundEventAnnotation?: (annotation: SoundEventAnnotation) => void;
  /** Callback when a tag is added to a clip annotation . */
  onAddClipTag?: (annotation: ClipAnnotation, tag: Tag) => void;
  /** Callback when a tag is removed from a clip annotation . */
  onRemoveClipTag?: (annotation: ClipAnnotation, tag: Tag) => void;
  /** Callback when the spectrogram parameters are changed. */
  onParameterSave?: (parameters: SpectrogramParameters) => void;
}) {
  const { data, addTag, removeTag, addNote, removeNote } = useClipAnnotation({
    uuid: clipAnnotation.uuid,
    clipAnnotation,
  });

  const onClearTags = useCallback(async () => {
    const tags = clipAnnotation.tags?.slice(0);
    if (tags == null) return;
    for (const tag of tags) {
      await removeTag.mutateAsync(tag);
    }
  }, [clipAnnotation, removeTag]);

  if (data == null) return null;

  return (
    <div className="flex flex-row w-full gap-8">
      <div className="grow flex flex-col gap-2">
        <RecordingHeader recording={data.clip.recording} />
        <RecordingTagBar recording={data.clip.recording} />
        <ClipAnnotationSpectrogram
          parameters={parameters}
          clipAnnotation={data}
          onParameterSave={onParameterSave}
          tagFilter={tagFilter}
        />
      </div>
      <div className="w-96 flex flex-col gap-4">
        <ClipAnnotationTags
          tagFilter={tagFilter}
          clipAnnotation={data}
          onAddTag={addTag.mutate}
          onRemoveTag={removeTag.mutate}
          onClearTags={onClearTags}
        />
        <ClipAnnotationNotes
          onCreateNote={addNote.mutate}
          onDeleteNote={removeNote.mutate}
          clipAnnotation={data}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
}
