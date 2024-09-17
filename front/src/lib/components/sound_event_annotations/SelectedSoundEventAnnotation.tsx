import Card from "@/lib/components/ui/Card";
import SoundEventAnnotationDetails from "@/lib/components/sound_event_annotations/SoundEventAnnotationDetails";
import SoundEventAnnotationNotes from "@/lib/components/sound_event_annotations/SoundEventAnnotationNotes";
import SoundEventAnnotationTags from "@/lib/components/sound_event_annotations/SoundEventAnnotationTags";

import type { NoteCreate } from "@/lib/api/notes";
import type { SoundEventAnnotation, Tag } from "@/lib/types";

export default function SelectedSoundEventAnnotation({
  soundEventAnnotation,
  onAddSoundEventAnnotationTag,
  onDeleteSoundEventAnnotationTag,
  onCreateSoundEventAnnotationNote,
  onCreateTag,
}: {
  soundEventAnnotation: SoundEventAnnotation;
  onAddSoundEventAnnotationTag?: (tag: Tag) => void;
  onDeleteSoundEventAnnotationTag?: (tag: Tag) => void;
  onCreateSoundEventAnnotationNote?: (note: NoteCreate) => void;
  onCreateTag?: (tag: Tag) => void;
}) {
  return (
    <div className="flex flex-row gap-8 py-4 w-full">
      <Card className="grow">
        <div className="flex flex-col gap-8">
          <SoundEventAnnotationDetails
            soundEventAnnotation={soundEventAnnotation}
          />
          <SoundEventAnnotationTags
            soundEventAnnotation={soundEventAnnotation}
            onAddTag={onAddSoundEventAnnotationTag}
            onRemoveTag={onDeleteSoundEventAnnotationTag}
            onCreateTag={onCreateTag}
          />
        </div>
      </Card>
      <SoundEventAnnotationNotes
        soundEventAnnotation={soundEventAnnotation}
        onCreateNote={onCreateSoundEventAnnotationNote}
      />
    </div>
  );
}
