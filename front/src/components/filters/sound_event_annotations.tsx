import FilterBadge from "@/components/filters/FilterBadge";
import { type FilterDef } from "@/components/filters/FilterMenu";
import { TagFilter } from "@/components/filters/Filters";
import { TagIcon } from "@/components/icons";

import type { SoundEventAnnotationFilter } from "@/api/sound_event_annotations";

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
