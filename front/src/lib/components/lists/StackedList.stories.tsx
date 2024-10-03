import type { Meta, StoryObj } from "@storybook/react";

import StackedList from "./StackedList";

const meta: Meta<typeof StackedList> = {
  title: "List/Stacked",
  component: StackedList,
};

export default meta;

type Story = StoryObj<typeof StackedList>;

export const Primary: Story = {
  args: {
    items: [
      <div key="1">Item 1</div>,
      <div key="2">Item 2</div>,
      <div key="3">Item 3</div>,
    ],
  },
};
