import type { Meta, StoryObj } from "@storybook/react";

import FilterButton from "./FilterButton";

const meta: Meta<typeof FilterButton> = {
  title: "Filters/Button",
  component: FilterButton,
  args: {
    children: () => "Filter",
  },
};

export default meta;

type Story = StoryObj<typeof FilterButton>;

export const Primary: Story = {
  args: {
    title: "Filter Title",
  },
};
