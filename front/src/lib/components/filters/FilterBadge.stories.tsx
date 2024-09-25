import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import FilterBadge from "./FilterBadge";

const meta: Meta<typeof FilterBadge> = {
  title: "Filters/Badge",
  component: FilterBadge,
  args: {
    onRemove: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof FilterBadge>;

export const Primary: Story = {
  args: {
    field: "species",
    value: "Myotis lucifugus",
  },
};

export const Numeric: Story = {
  args: {
    field: "altitude",
    value: 3000,
    operation: ">",
  },
};
