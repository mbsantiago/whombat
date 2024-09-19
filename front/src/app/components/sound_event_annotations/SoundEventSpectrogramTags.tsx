import {
  SoundEventSpectrogramTagsBase,
  SoundEventSpectrogramTagsProps,
} from "@/lib/components/spectrograms/SpectrogramTags";
import ProjectTagSearch from "../tags/ProjectTagsSearch";

import useStore from "@/app/store";
import useSoundEventAnnotation from "@/app/hooks/api/useSoundEventAnnotation";

export default function SoundEventAnnotationTags({
  soundEvent,
  ...props
}: SoundEventSpectrogramTagsProps) {
  const tagColorFn = useStore((state) => state.getTagColor);

  const { data, addTag, removeTag } = useSoundEventAnnotation({
    uuid: soundEvent.uuid,
    soundEventAnnotation: soundEvent,
    onAddTag: props.onAddTag,
    onRemoveTag: props.onRemoveTag,
  });

  return (
    <SoundEventSpectrogramTagsBase
      soundEvent={data || soundEvent}
      {...props}
      tagColorFn={tagColorFn}
      onAddTag={addTag.mutate}
      onRemoveTag={removeTag.mutate}
      TagSearchBar={ProjectTagSearch}
    />
  );
}
