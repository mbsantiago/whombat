import type { Meta, StoryObj } from "@storybook/react";

import TableHeader from "./TableHeader";

const meta: Meta<typeof TableHeader> = {
  title: "Table/Header",
  component: TableHeader,
};

export default meta;

type Story = StoryObj<typeof TableHeader>;

export const Primary: Story = {
  args: {
    children: "Header",
  },
};
