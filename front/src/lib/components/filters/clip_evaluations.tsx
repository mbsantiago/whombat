import FilterBadge, {
  NumberFilterBadge,
} from "@/lib/components/filters/FilterBadge";
import { type FilterDef } from "@/lib/components/filters/FilterMenu";
import { FloatFilter, TagFilter } from "@/lib/components/filters/Filters";
import { TagIcon, ScoreIcon } from "@/lib/components/icons";

import type { ClipEvaluationFilter } from "@/lib/api/clip_evaluations";

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
      <TagIcon className="h-5 w-5 inline-block text-stone-500 mr-1 align-middle" />
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
      <TagIcon className="h-5 w-5 inline-block text-stone-500 mr-1 align-middle" />
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
      <ScoreIcon className="h-5 w-5 inline-block text-stone-500 mr-1 align-middle" />
    ),
  },
];

export default clipEvaluationFilterDef;
