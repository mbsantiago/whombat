import FilterBadge from "@/components/filters/FilterBadge";
import { type FilterDef } from "@/components/filters/FilterMenu";
import { TagFilter } from "@/components/filters/Filters";
import { TagIcon } from "@/components/icons";

import type { ClipAnnotationFilter } from "@/lib/api/clip_annotations";

const clipAnnotationFilterDef: FilterDef<ClipAnnotationFilter>[] = [
  {
    field: "tag",
    name: "Clip Tag",
    render: ({ value, clear }) => (
      <FilterBadge
        field="Clip Tag"
        value={`${value.key}: ${value.value}`}
        onRemove={clear}
      />
    ),
    selector: ({ setFilter }) => (
      <TagFilter onChange={(val) => setFilter("tag", val)} />
    ),
    description: "Select clips with a specific tag.",
    icon: (
      <TagIcon className="h-5 w-5 inline-block text-stone-500 mr-1 align-middle" />
    ),
  },
];

export default clipAnnotationFilterDef;
