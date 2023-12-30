import Card from "@/components/Card";
import SoundEventAnnotationDetails from "@/components/sound_event_annotations/SoundEventAnnotationDetails";
import SoundEventAnnotationNotes from "@/components/sound_event_annotations/SoundEventAnnotationNotes";
import SoundEventAnnotationTags from "@/components/sound_event_annotations/SoundEventAnnotationTags";
import useSoundEventAnnotation from "@/hooks/api/useSoundEventAnnotation";

import type { TagFilter } from "@/api/tags";
import type { ClipAnnotation, SoundEventAnnotation } from "@/types";

export default function SelectedSoundEventAnnotation({
  soundEventAnnotation: data,
  clipAnnotation,
  tagFilter,
  onAddTag,
  onRemoveTag,
}: {
  //* The sound event annotation to display */
  soundEventAnnotation: SoundEventAnnotation;
  /** The clip annotation to which the sound event annotation belongs */
  clipAnnotation: ClipAnnotation;
  /** The tag filter to apply in case more tags want to be added */
  tagFilter?: TagFilter;
  onAddTag?: (annotation: SoundEventAnnotation) => void;
  onRemoveTag?: (annotation: SoundEventAnnotation) => void;
}) {
  const soundEventAnnotation = useSoundEventAnnotation({
    uuid: data.uuid,
    clipAnnotation,
    soundEventAnnotation: data,
    onAddTag,
    onRemoveTag,
  });

  return (
    <div className="w-full flex flex-row gap-8 py-4">
      <Card className="grow">
        <div className="flex flex-col gap-8">
          <SoundEventAnnotationDetails
            soundEventAnnotation={soundEventAnnotation.data || data}
          />
          <SoundEventAnnotationTags
            tagFilter={tagFilter}
            soundEventAnnotation={soundEventAnnotation.data || data}
            onAddTag={soundEventAnnotation.addTag.mutate}
            onRemoveTag={soundEventAnnotation.removeTag.mutate}
          />
        </div>
      </Card>
      <Card className="grow">
        <SoundEventAnnotationNotes
          soundEventAnnotation={soundEventAnnotation.data || data}
          onCreateNote={soundEventAnnotation.addNote.mutate}
        />
      </Card>
    </div>
  );
}
