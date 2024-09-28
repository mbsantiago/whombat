import useSoundEventAnnotation from "@/app/hooks/api/useSoundEventAnnotation";

import useStore from "@/app/store";

import SelectedSoundEventAnnotationBase from "@/lib/components/sound_event_annotations/SelectedSoundEventAnnotation";

import type { SoundEventAnnotation } from "@/lib/types";

import ProjectTagSearch from "../tags/ProjectTagsSearch";

export default function SelectedSoundEventAnnotation({
  soundEventAnnotation,
}: {
  soundEventAnnotation: SoundEventAnnotation;
}) {
  const tagColorFn = useStore((state) => state.getTagColor);

  const { data, addTag, removeTag, addNote, updateNote, removeNote } =
    useSoundEventAnnotation({
      uuid: soundEventAnnotation.uuid,
      soundEventAnnotation,
    });

  return (
    <SelectedSoundEventAnnotationBase
      soundEventAnnotation={data || soundEventAnnotation}
      onAddSoundEventAnnotationTag={addTag.mutate}
      onDeleteSoundEventAnnotationTag={removeTag.mutate}
      TagSearchBar={ProjectTagSearch}
      tagColorFn={tagColorFn}
      onCreateSoundEventAnnotationNote={addNote.mutate}
      onUpdateSoundEventAnnotationNote={(note, data) =>
        updateNote.mutate({ note, data })
      }
      onDeleteSoundEventAnnotationNote={removeNote.mutate}
    />
  );
}
