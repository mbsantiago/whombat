import {
  VerifiedIcon,
  NeedsReviewIcon,
  UserIcon,
  TagIcon,
  EditIcon,
  DatasetIcon,
} from "@/components/icons";
import { FloatFilter, BooleanFilter, TagFilter } from "@/components/filters/Filters";
import { type FilterDef } from "@/components/filters/FilterMenu";


const tasksFilterDefs : FilterDef[] = [
  {
    name: "Pending",
    selector: ({ setFilter }) => (
      <BooleanFilter prefix="pending" setFilter={setFilter} />
    ),
    description: "Select only tasks that are pending",
    icon: (
      <EditIcon className="h-5 w-5 inline-block text-stone-500 mr-1 align-middle" />
    ),
  },
  {
    name: "Verified",
    selector: ({ setFilter }) => (
      <BooleanFilter prefix="verified" setFilter={setFilter} />
    ),
    description: "Select tasks by their verified status",
    icon: (
      <VerifiedIcon className="h-5 w-5 inline-block text-stone-500 mr-1 align-middle" />
    ),
  },

  {
    name: "Needs Review",
    selector: ({ setFilter }) => <BooleanFilter prefix="rejected" setFilter={setFilter} />,
    description: "Select tasks by their review status",
    icon: (
      <NeedsReviewIcon className="h-5 w-5 inline-block text-stone-500 mr-1 align-middle" />
    ),
  },

  {
    name: "Assigned",
    selector: ({ setFilter }) => <BooleanFilter prefix="assigned" setFilter={setFilter} />,
    description: "Select tasks that have been assigned",
    icon: (
      <UserIcon className="h-5 w-5 inline-block text-stone-500 mr-1 align-middle" />
    ),
  },

  {
    name: "Assigned to me",
    selector: ({ setFilter }) => <BooleanFilter prefix="assigned_to" setFilter={setFilter} />,
    description: "Select tasks that have been assigned to you",
    icon: (
      <UserIcon className="h-5 w-5 inline-block text-stone-500 mr-1 align-middle" />
    ),
  },

  {
    name: "Dataset",
    selector: ({ setFilter }) => <FloatFilter setFilter={setFilter} />,
    description: "Select tasks that come from a specific dataset",
    icon: (
      <DatasetIcon className="h-5 w-5 inline-block text-stone-500 mr-1 align-middle" />
    ),
  },

  {
    name: "Recording Tag",
    selector: ({ setFilter }) => <TagFilter prefix="recording_tag" setFilter={setFilter} />,
    description: "Select task that come from a recording with a specific tag",
    icon: (
      <TagIcon className="h-5 w-5 inline-block text-stone-500 mr-1 align-middle" />
    ),
  },
];

export default tasksFilterDefs;
