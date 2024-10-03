import FilterBadge from "@/lib/components/filters/FilterBadge";
import { type FilterDef } from "@/lib/components/filters/FilterMenu";
import { TagFilter } from "@/lib/components/filters/Filters";
import { TagIcon } from "@/lib/components/icons";

import type { ClipAnnotationFilter } from "@/lib/types";

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
      <TagIcon className="inline-block mr-1 w-5 h-5 align-middle text-stone-500" />
    ),
  },
];

export default clipAnnotationFilterDef;
