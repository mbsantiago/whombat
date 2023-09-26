import { useState } from "react";
import { useDebounce } from "react-use";

import SearchMenu from "@/components/SearchMenu";
import useAnnotationProjects from "@/hooks/api/useAnnotationProjects";
import {
  type AnnotationProjectFilter,
  type AnnotationProject,
} from "@/api/annotation_projects";

export default function SearchAnnotationProjects({
  filter,
  value,
  limit = 6,
  onSelect,
}: {
  value?: AnnotationProject;
  filter?: AnnotationProjectFilter;
  limit?: number;
  onSelect?: (project: AnnotationProject) => void;
}) {
  const [query, setQuery] = useState("");

  const annotationProjects = useAnnotationProjects({
    filter,
  });

  useDebounce(
    () => {
      annotationProjects.filter.set("search", query);
    },
    500,
    [query],
  );

  return (
    <SearchMenu
      value={value}
      options={annotationProjects.items}
      limit={limit}
      fields={["name"]}
      initialQuery={query}
      onChange={setQuery}
      onSelect={onSelect}
      static={false}
      displayValue={(project) => project.name}
      renderOption={(option) => option.name}
      getOptionKey={(option) => option.id}
    />
  );
}
