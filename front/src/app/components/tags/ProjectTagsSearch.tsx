import { ComponentProps, useCallback, useContext, useMemo } from "react";

import useAnnotationProject from "@/app/hooks/api/useAnnotationProject";

import AnnotationProjectContext from "@/app/contexts/annotationProject";

import { type Tag } from "@/lib/types";

import TagSearchBar from "./TagSearchBar";

export default function ProjectTagSearch({
  onCreateTag,
  ...props
}: Omit<ComponentProps<typeof TagSearchBar>, "filter" | "fixed">) {
  const annotationProject = useContext(AnnotationProjectContext);

  const { data, addTag } = useAnnotationProject({
    uuid: annotationProject.uuid,
    annotationProject,
  });

  const filter = useMemo(
    () => ({
      annotation_project: data || annotationProject,
    }),
    [data, annotationProject],
  );

  const handleCreateTag = useCallback(
    (tag: Tag) => {
      addTag.mutate(tag);
      onCreateTag?.(tag);
    },
    [addTag, onCreateTag],
  );

  return (
    <TagSearchBar
      onCreateTag={handleCreateTag}
      filter={filter}
      fixed={["annotation_project"]}
      {...props}
    />
  );
}
