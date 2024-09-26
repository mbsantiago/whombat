import FilterBadge from "@/lib/components/filters/FilterBadge";
import type { FilterDef } from "@/lib/components/filters/FilterMenu";
import { BooleanFilter } from "@/lib/components/filters/Filters";
import {
  CompleteIcon,
  EditIcon,
  NeedsReviewIcon,
  VerifiedIcon,
} from "@/lib/components/icons";

import type { AnnotationTaskFilter } from "@/lib/types";

// TODO: Create custom filter for integer, date, time, tags and boolean values
const annotationTaskFilterDefs: FilterDef<AnnotationTaskFilter>[] = [
  {
    name: "Verified",
    field: "verified",
    selector: ({ setFilter }) => (
      <BooleanFilter onChange={(val) => setFilter("verified", val)} />
    ),
    render: ({ value, clear }) => (
      <FilterBadge
        field="Verified"
        value={value ? "Yes" : "No"}
        onRemove={clear}
      />
    ),
    description: "Select only verified annotation tasks.",
    icon: (
      <VerifiedIcon className="inline-block mr-1 w-5 h-5 align-middle text-stone-500" />
    ),
  },
  {
    name: "Needs Review",
    field: "rejected",
    selector: ({ setFilter }) => (
      <BooleanFilter onChange={(val) => setFilter("rejected", val)} />
    ),
    render: ({ value, clear }) => (
      <FilterBadge
        field="Rejected"
        value={value ? "Yes" : "No"}
        onRemove={clear}
      />
    ),
    description: "Select only annotation tasks that need review.",
    icon: (
      <NeedsReviewIcon className="inline-block mr-1 w-5 h-5 align-middle text-stone-500" />
    ),
  },
  {
    name: "Pending",
    field: "pending",
    selector: ({ setFilter }) => (
      <BooleanFilter onChange={(val) => setFilter("pending", val)} />
    ),
    render: ({ value, clear }) => (
      <FilterBadge
        field="Pending"
        value={value ? "Yes" : "No"}
        onRemove={clear}
      />
    ),
    description: "Select only pending annotation tasks.",
    icon: (
      <EditIcon className="inline-block mr-1 w-5 h-5 align-middle text-stone-500" />
    ),
  },
  {
    name: "Completed",
    field: "completed",
    selector: ({ setFilter }) => (
      <BooleanFilter onChange={(val) => setFilter("completed", val)} />
    ),
    render: ({ value, clear }) => (
      <FilterBadge
        field="Completed"
        value={value ? "Yes" : "No"}
        onRemove={clear}
      />
    ),
    description: "Select only verified annotation tasks.",
    icon: (
      <CompleteIcon className="inline-block mr-1 w-5 h-5 align-middle text-stone-500" />
    ),
  },
];

export default annotationTaskFilterDefs;
