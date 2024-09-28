import SoundEventAnnotationDetails from "@/lib/components/sound_event_annotations/SoundEventAnnotationDetails";
import SoundEventAnnotationNotes from "@/lib/components/sound_event_annotations/SoundEventAnnotationNotes";
import SoundEventAnnotationTags from "@/lib/components/sound_event_annotations/SoundEventAnnotationTags";
import Card from "@/lib/components/ui/Card";

import type {
  Note,
  NoteCreate,
  NoteUpdate,
  SoundEventAnnotation,
  Tag,
} from "@/lib/types";

export default function SelectedSoundEventAnnotation({
  soundEventAnnotation,
  onAddSoundEventAnnotationTag,
  onDeleteSoundEventAnnotationTag,
  onCreateSoundEventAnnotationNote,
  onUpdateSoundEventAnnotationNote,
  onDeleteSoundEventAnnotationNote,
  onCreateTag,
  ...props
}: {
  soundEventAnnotation: SoundEventAnnotation;
  onAddSoundEventAnnotationTag?: (tag: Tag) => void;
  onDeleteSoundEventAnnotationTag?: (tag: Tag) => void;
  onCreateSoundEventAnnotationNote?: (note: NoteCreate) => void;
  onUpdateSoundEventAnnotationNote?: (note: Note, data: NoteUpdate) => void;
  onDeleteSoundEventAnnotationNote?: (note: Note) => void;
  onCreateTag?: (tag: Tag) => void;
} & Omit<
  Parameters<typeof SoundEventAnnotationTags>[0],
  "soundEventAnnotation"
>) {
  return (
    <div className="flex flex-row gap-8 py-4 w-full">
      <Card className="grow">
        <SoundEventAnnotationDetails
          soundEventAnnotation={soundEventAnnotation}
        />
      </Card>
      <Card className="grow">
        <SoundEventAnnotationTags
          soundEventAnnotation={soundEventAnnotation}
          onAddTag={onAddSoundEventAnnotationTag}
          onRemoveTag={onDeleteSoundEventAnnotationTag}
          onCreateTag={onCreateTag}
          {...props}
        />
      </Card>
      <SoundEventAnnotationNotes
        soundEventAnnotation={soundEventAnnotation}
        onCreateNote={onCreateSoundEventAnnotationNote}
        onDeleteNote={onDeleteSoundEventAnnotationNote}
        onUpdateNote={onUpdateSoundEventAnnotationNote}
      />
    </div>
  );
}
