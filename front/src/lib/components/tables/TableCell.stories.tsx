import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import TableCell from "./TableCell";

const meta: Meta<typeof TableCell> = {
  title: "Table/Cell",
  component: TableCell,
};

export default meta;

type Story = StoryObj<typeof TableCell>;

export const Primary: Story = {
  args: {
    children: "Cell content",
  },
};

export const Editable: Story = {
  args: {
    children: "Cell content",
    editable: true,
  },
};
