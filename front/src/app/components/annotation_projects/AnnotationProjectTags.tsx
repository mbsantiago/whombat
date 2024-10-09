import TagSearchBar from "@/app/components/tags/TagSearchBar";

import useAnnotationProject from "@/app/hooks/api/useAnnotationProject";

import useStore from "@/app/store";

import AnnotationProjectTagsBase from "@/lib/components/annotation_projects/AnnotationProjectTags";

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
  const tagColorFn = useStore((state) => state.getTagColor);

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
      tagColorFn={tagColorFn}
    />
  );
}
