import { ComponentProps } from "react";
import ClipAnnotationSpectrogram from "../clip_annotations/ClipAnnotationSpectrogram";
import ClipAnnotationSoundEvents from "../clip_annotations/ClipAnnotationSoundEvents";

import type { AnnotationTask } from "@/lib/types";

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
