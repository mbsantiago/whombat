import { ComponentProps, useMemo, useContext } from "react";

import useAnnotationProject from "@/app/hooks/api/useAnnotationProject";

import TagSearchBar from "./TagSearchBar";
import AnnotationProjectContext from "@/app/contexts/annotationProject";

export default function ProjectTagSearch(
  props: Omit<
    ComponentProps<typeof TagSearchBar>,
    "onCreateTag" | "filter" | "fixed"
  >,
) {
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

  return (
    <TagSearchBar
      onCreateTag={(tag) => addTag.mutate(tag)}
      filter={filter}
      fixed={["annotation_project"]}
      {...props}
    />
  );
}
