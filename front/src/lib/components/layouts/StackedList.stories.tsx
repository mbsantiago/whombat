import type { Meta, StoryObj } from "@storybook/react";

import StackedList from "./StackedList";

const meta: Meta<typeof StackedList<string>> = {
  title: "Layout/StackedList",
  component: StackedList<string>,
};

export default meta;

type Story = StoryObj<typeof StackedList<string>>;

export const Primary: Story = {
  args: {
    children: (item: string) => <div>{item}</div>,
    items: ["Item 1", "Item 2", "Item 3"],
  },
};

export const Empty: Story = {
  args: {
    children: (item: string) => <div>{item}</div>,
    items: [],
  },
};
