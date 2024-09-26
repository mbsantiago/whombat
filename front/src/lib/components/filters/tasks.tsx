import FilterBadge from "@/lib/components/filters/FilterBadge";
import { type FilterDef } from "@/lib/components/filters/FilterMenu";
import {
  BooleanFilter,
  DatasetFilter,
  TagFilter,
} from "@/lib/components/filters/Filters";
import {
  DatasetIcon,
  EditIcon,
  NeedsReviewIcon,
  TagIcon,
  VerifiedIcon,
} from "@/lib/components/icons";

import type { AnnotationTaskFilter } from "@/lib/types";

const tasksFilterDefs: FilterDef<AnnotationTaskFilter>[] = [
  {
    field: "pending",
    name: "Pending",
    render: ({ value, clear }) => (
      <FilterBadge
        field="Pending"
        value={value ? "Yes" : "No"}
        onRemove={clear}
      />
    ),
    selector: ({ setFilter }) => (
      <BooleanFilter onChange={(val) => setFilter("pending", val)} />
    ),
    description: "Select only tasks that are pending",
    icon: (
      <EditIcon className="inline-block mr-1 w-5 h-5 align-middle text-stone-500" />
    ),
  },
  {
    field: "verified",
    name: "Verified",
    render: ({ value, clear }) => (
      <FilterBadge
        field="Verified"
        value={value ? "Yes" : "No"}
        onRemove={clear}
      />
    ),
    selector: ({ setFilter }) => (
      <BooleanFilter onChange={(val) => setFilter("verified", val)} />
    ),
    description: "Select tasks by their verified status",
    icon: (
      <VerifiedIcon className="inline-block mr-1 w-5 h-5 align-middle text-stone-500" />
    ),
  },
  {
    field: "rejected",
    name: "Needs Review",
    render: ({ value, clear }) => (
      <FilterBadge
        field="Needs Review"
        value={value ? "Yes" : "No"}
        onRemove={clear}
      />
    ),
    selector: ({ setFilter }) => (
      <BooleanFilter onChange={(val) => setFilter("rejected", val)} />
    ),
    description: "Select tasks by their review status",
    icon: (
      <NeedsReviewIcon className="inline-block mr-1 w-5 h-5 align-middle text-stone-500" />
    ),
  },

  {
    field: "sound_event_annotation_tag",
    name: "Sound Event Tag",
    render: ({ value, clear }) => (
      <FilterBadge
        field="Sound Event Tag"
        value={`${value.key}: ${value.value}`}
        onRemove={clear}
      />
    ),
    selector: ({ setFilter }) => (
      <TagFilter
        onChange={(val) => setFilter("sound_event_annotation_tag", val)}
      />
    ),
    description: "Select task that contain a sound event with a specific tag",
    icon: (
      <TagIcon className="inline-block mr-1 w-5 h-5 align-middle text-stone-500" />
    ),
  },

  {
    field: "dataset",
    name: "Dataset",
    render: ({ value, clear }) => (
      <FilterBadge field="Dataset" value={value.name} onRemove={clear} />
    ),
    selector: ({ setFilter }) => (
      <DatasetFilter onChange={(val) => setFilter("dataset", val)} />
    ),
    description: "Select tasks that come from a specific dataset",
    icon: (
      <DatasetIcon className="inline-block mr-1 w-5 h-5 align-middle text-stone-500" />
    ),
  },

  {
    field: "recording_tag",
    name: "Recording Tag",
    render: ({ value, clear }) => (
      <FilterBadge
        field="Recording Tag"
        value={`${value.key}: ${value.value}`}
        onRemove={clear}
      />
    ),
    selector: ({ setFilter }) => (
      <TagFilter onChange={(val) => setFilter("recording_tag", val)} />
    ),
    description: "Select task that come from a recording with a specific tag",
    icon: (
      <TagIcon className="inline-block mr-1 w-5 h-5 align-middle text-stone-500" />
    ),
  },
];

export default tasksFilterDefs;
