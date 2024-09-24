import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import FilterBadge from "@/lib/components/filters/FilterBadge";
import type { FilterDef } from "@/lib/components/filters/FilterMenu";
import { BooleanFilter } from "@/lib/components/filters/Filters";
import { VerifiedIcon } from "@/lib/components/icons";

import type { AnnotationTaskFilter } from "@/lib/types";

import FilterBar from "./FilterBar";

const meta: Meta<typeof FilterBar> = {
  title: "Filters/Bar",
  component: FilterBar,
};

export default meta;

type Story = StoryObj<typeof FilterBar>;

const filterDef: FilterDef<AnnotationTaskFilter>[] = [
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
];

export const Primary: Story = {
  args: {
    filterDef,
    filter: { verified: true },
    onClearFilterField: fn(),
  },
};
