import { useState } from "react";
import { useDebounce } from "react-use";

import useAnnotationProjects from "@/app/hooks/api/useAnnotationProjects";

import SearchMenu from "@/lib/components/search/SearchMenu";

import type { AnnotationProject, AnnotationProjectFilter } from "@/lib/types";

export default function AnnotationProjectSearch({
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
      getOptionKey={(option) => option.uuid}
    />
  );
}
