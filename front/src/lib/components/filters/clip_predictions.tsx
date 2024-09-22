import FilterBadge from "@/lib/components/filters/FilterBadge";
import { type FilterDef } from "@/lib/components/filters/FilterMenu";
import { TagFilter } from "@/lib/components/filters/Filters";
import { TagIcon } from "@/lib/components/icons";

import type { ClipPredictionFilter } from "@/lib/api/clip_predictions";

const clipPredictionFilterDef: FilterDef<ClipPredictionFilter>[] = [
  {
    field: "tag",
    name: "Clip Tag",
    render: ({ value, clear }) => (
      <FilterBadge
        field="Clip Tag"
        value={`${value.tag.key}: ${value.tag.value}`}
        onRemove={clear}
      />
    ),
    selector: ({ setFilter }) => (
      <TagFilter onChange={(val) => setFilter("tag", { tag: val })} />
    ),
    description: "Select clip predictions that have a given tag",
    icon: (
      <TagIcon className="h-5 w-5 inline-block text-stone-500 mr-1 align-middle" />
    ),
  },
  {
    field: "sound_event_tag",
    name: "Sound Event Tag",
    render: ({ value, clear }) => (
      <FilterBadge
        field="Sound Event Tag"
        value={`${value.tag.key}: ${value.tag.value}`}
        onRemove={clear}
      />
    ),
    selector: ({ setFilter }) => (
      <TagFilter
        onChange={(val) => setFilter("sound_event_tag", { tag: val })}
      />
    ),
    description:
      "Select clip predictions that have a predicted sound event with a given tag",
    icon: (
      <TagIcon className="h-5 w-5 inline-block text-stone-500 mr-1 align-middle" />
    ),
  },
];

export default clipPredictionFilterDef;
