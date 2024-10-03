import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

import api from "@/app/api";
import useStore from "@/app/store";

import AnnotationProjectTagsSummaryBase from "@/lib/components/annotation_projects/AnnotationProjectTagsSummary";

import usePagedQuery from "@/lib/hooks/utils/usePagedQuery";

import type { AnnotationProject } from "@/lib/types";

/**
 * Component to display a summary of tags for a annotation_project.
 */
export default function AnnotationProjectTagsSummary({
  annotationProject,
}: {
  annotationProject: AnnotationProject;
}) {
  const router = useRouter();

  const tagColorFn = useStore((state) => state.getTagColor);

  const handleAddTag = useCallback(() => {
    router.push(
      `/annotation_projects/detail/tags/?annotation_project_uuid=${annotationProject.uuid}`,
    );
  }, [router, annotationProject.uuid]);

  const filter = useMemo(
    () => ({ annotation_project: annotationProject }),
    [annotationProject],
  );

  const {
    items: clipTags,
    query: { isLoading: isLoadingClipTags },
  } = usePagedQuery({
    name: "clip_annotation_tags",
    queryFn: api.tags.getClipAnnotationCounts,
    pageSize: -1,
    filter,
  });

  const {
    items: soundEventTags,
    query: { isLoading: isLoadingSoundEventTags },
  } = usePagedQuery({
    name: "sound_event_annotation_tags",
    queryFn: api.tags.getSoundEventAnnotationCounts,
    pageSize: -1,
    filter,
  });

  return (
    <AnnotationProjectTagsSummaryBase
      annotationProject={annotationProject}
      tagColorFn={tagColorFn}
      onAddTags={handleAddTag}
      clipTags={clipTags}
      soundEventTags={soundEventTags}
      isLoading={isLoadingClipTags || isLoadingSoundEventTags}
    />
  );
}
