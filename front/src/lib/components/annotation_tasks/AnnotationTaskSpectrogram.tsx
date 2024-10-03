import { ComponentProps } from "react";

import type { AnnotationTask } from "@/lib/types";

import ClipAnnotationSoundEvents from "../clip_annotations/ClipAnnotationSoundEvents";
import ClipAnnotationSpectrogram from "../clip_annotations/ClipAnnotationSpectrogram";

export default function AnnotationTaskSpectrogram({
  task,
  ...props
}: {
  task: AnnotationTask;
} & ComponentProps<typeof ClipAnnotationSpectrogram>) {
  return (
    <div>
      <ClipAnnotationSpectrogram {...props} />
    </div>
  );
}
