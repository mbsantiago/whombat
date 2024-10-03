import type { Meta, StoryObj } from "@storybook/react";

import ListCounts from "./ListCounts";

const meta: Meta<typeof ListCounts> = {
  title: "List/Counts",
  component: ListCounts,
};

export default meta;

type Story = StoryObj<typeof ListCounts>;

export const Primary: Story = {
  args: {
    total: 100,
    startIndex: 20,
    endIndex: 40,
  },
};
