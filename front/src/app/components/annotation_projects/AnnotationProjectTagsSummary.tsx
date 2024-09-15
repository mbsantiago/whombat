import { useRouter } from "next/navigation";
import AnnotationProjectTagsSummaryBase from "@/lib/components/annotation_projects/AnnotationProjectTagsSummary";
import useStore from "@/app/store";

import type { AnnotationProject } from "@/lib/types";
import { useCallback } from "react";

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

  // TODO: implement get clip and sound event tags
  return (
    <AnnotationProjectTagsSummaryBase
      annotationProject={annotationProject}
      tagColorFn={tagColorFn}
      onAddTags={handleAddTag}
    />
  );
}
