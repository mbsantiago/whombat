import FilterBadge, {
  NumberFilterBadge,
} from "@/lib/components/filters/FilterBadge";
import { type FilterDef } from "@/lib/components/filters/FilterMenu";
import { FloatFilter, TagFilter } from "@/lib/components/filters/Filters";
import { ScoreIcon, TagIcon } from "@/lib/components/icons";

import type { ClipEvaluationFilter } from "@/lib/types";

const clipEvaluationFilterDef: FilterDef<ClipEvaluationFilter>[] = [
  {
    field: "prediction_tag",
    name: "Predicted Tag",
    render: ({ value, clear }) => (
      <FilterBadge
        field="Predicted Tag"
        value={`${value.tag.key}: ${value.tag.value}`}
        onRemove={clear}
      />
    ),
    selector: ({ setFilter }) => (
      <TagFilter
        onChange={(val) => setFilter("prediction_tag", { tag: val })}
      />
    ),
    description: "Select clips with a specific predicted tag.",
    icon: (
      <TagIcon className="inline-block mr-1 w-5 h-5 align-middle text-stone-500" />
    ),
  },
  {
    field: "annotation_tag",
    name: "True Tag",
    render: ({ value, clear }) => (
      <FilterBadge
        field="True Tag"
        value={`${value.key}: ${value.value}`}
        onRemove={clear}
      />
    ),
    selector: ({ setFilter }) => (
      <TagFilter onChange={(val) => setFilter("annotation_tag", val)} />
    ),
    description: "Select clips with a specific true tag.",
    icon: (
      <TagIcon className="inline-block mr-1 w-5 h-5 align-middle text-stone-500" />
    ),
  },
  {
    field: "score",
    name: "Score",
    selector: ({ setFilter }) => (
      <FloatFilter
        name="duration"
        onChange={(val) => setFilter("score", val)}
      />
    ),
    render: ({ value, clear }) => (
      <NumberFilterBadge field="Score" value={value} onRemove={clear} />
    ),
    icon: (
      <ScoreIcon className="inline-block mr-1 w-5 h-5 align-middle text-stone-500" />
    ),
  },
];

export default clipEvaluationFilterDef;
