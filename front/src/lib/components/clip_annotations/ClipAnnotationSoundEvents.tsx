import type { SoundEventAnnotation } from "@/lib/types";
import { type ComponentProps } from "react";

import Empty from "../Empty";
import SelectedSoundEventAnnotation from "../sound_event_annotations/SelectedSoundEventAnnotation";

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