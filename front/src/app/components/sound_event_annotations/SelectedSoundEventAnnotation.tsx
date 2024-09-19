import SelectedSoundEventAnnotationBase from "@/lib/components/sound_event_annotations/SelectedSoundEventAnnotation";

import useStore from "@/app/store";
import useSoundEventAnnotation from "@/app/hooks/api/useSoundEventAnnotation";

import ProjectTagSearch from "../tags/ProjectTagsSearch";

import type { SoundEventAnnotation } from "@/lib/types";

export default function SelectedSoundEventAnnotation({
  soundEventAnnotation,
}: {
  soundEventAnnotation: SoundEventAnnotation;
}) {
  const tagColorFn = useStore((state) => state.getTagColor);

  const { data, addTag, removeTag } = useSoundEventAnnotation({
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
    />
  );
}
