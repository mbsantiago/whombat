import { type ComponentProps } from "react";

import type { SoundEventAnnotation } from "@/lib/types";

import SelectedSoundEventAnnotation from "../sound_event_annotations/SelectedSoundEventAnnotation";
import Empty from "../ui/Empty";

export default function ClipAnnotationSoundEvents({
  selectedSoundEventAnnotation,
  ...props
}: {
  selectedSoundEventAnnotation?: SoundEventAnnotation;
} & Omit<
  ComponentProps<typeof SelectedSoundEventAnnotation>,
  "soundEventAnnotation"
>) {
  if (selectedSoundEventAnnotation == null) {
    return <Empty>No sound event selected</Empty>;
  }

  return (
    <SelectedSoundEventAnnotation
      soundEventAnnotation={selectedSoundEventAnnotation}
      {...props}
    />
  );
}
