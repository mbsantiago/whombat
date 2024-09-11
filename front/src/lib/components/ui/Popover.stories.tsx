import type { Meta, StoryObj } from "@storybook/react";

import PopoverTrigger from "./Popover2";

const meta: Meta<typeof PopoverTrigger> = {
  title: "UI/Popover",
  component: PopoverTrigger,
  argTypes: {
    children: {
      table: {
        disable: true,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof PopoverTrigger>;

export const Primary: Story = {
  args: {
    children: <div>Content</div>,
    label: "Click me",
    placement: "bottom",
    containerPadding: 12,
    offset: 12,
    crossOffset: 0,
    shouldFlip: true,
  },
};

export const Top: Story = {
  args: {
    children: <div>Content</div>,
    label: "Click me",
    placement: "top",
  },
};
