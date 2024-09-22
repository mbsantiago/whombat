import { type ComponentProps, useMemo } from "react";

import type { SoundEventAnnotation } from "@/lib/types";

import TagPanel from "../tags/TagPanel";

export default function SoundEventAnnotationTags({
  soundEventAnnotation,
  ...props
}: {
  soundEventAnnotation: SoundEventAnnotation;
} & Omit<ComponentProps<typeof TagPanel>, "title" | "tags">) {
  const tags = useMemo(
    () => soundEventAnnotation.tags || [],
    [soundEventAnnotation],
  );

  return <TagPanel title="Sound Event Tags" tags={tags} {...props} />;
}
