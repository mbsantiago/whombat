import AnnotationProjectTagsBase from "@/lib/components/annotation_projects/AnnotationProjectTags";

import TagSearchBar from "@/app/components/tags/TagSearchBar";
import useAnnotationProject from "@/app/hooks/api/useAnnotationProject";

import type { AnnotationProject } from "@/lib/types";

export default function AnnotationProjectTags({
  annotationProject,
  onAddTag,
  onRemoveTag,
}: {
  annotationProject: AnnotationProject;
  onAddTag?: (project: AnnotationProject) => void;
  onRemoveTag?: (project: AnnotationProject) => void;
}) {
  const { data, removeTag, addTag } = useAnnotationProject({
    uuid: annotationProject.uuid,
    annotationProject: annotationProject,
    onAddTag,
    onRemoveTag,
  });

  return (
    <AnnotationProjectTagsBase
      annotationProject={data || annotationProject}
      onDeleteTag={removeTag.mutate}
      TagSearchBar={<TagSearchBar onSelectTag={addTag.mutate} />}
    />
  );
}
