import FilterBadge from "@/lib/components/filters/FilterBadge";
import { type FilterDef } from "@/lib/components/filters/FilterMenu";
import { TagFilter } from "@/lib/components/filters/Filters";
import { TagIcon } from "@/lib/components/icons";

import type { SoundEventAnnotationFilter } from "@/lib/api/sound_event_annotations";

const soundEventAnnotationFilterDef: FilterDef<SoundEventAnnotationFilter>[] = [
  {
    field: "tag",
    name: "Tag",
    render: ({ value, clear }) => (
      <FilterBadge
        field="Tag"
        value={`${value.key}: ${value.value}`}
        onRemove={clear}
      />
    ),
    selector: ({ setFilter }) => (
      <TagFilter onChange={(val) => setFilter("tag", val)} />
    ),
    description: "Select sound events that have a given tag",
    icon: (
      <TagIcon className="h-5 w-5 inline-block text-stone-500 mr-1 align-middle" />
    ),
  },
];

export default soundEventAnnotationFilterDef;
