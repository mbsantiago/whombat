import type { Meta, StoryObj } from "@storybook/nextjs";

import Button from "./Button";
import Tooltip from "./Tooltip";

const meta: Meta<typeof Tooltip> = {
  title: "UI/Tooltip",
  component: Tooltip,
  argTypes: {
    children: {
      table: {
        disable: true,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Tooltip>;

export const Primary: Story = {
  args: {
    children: <Button>Hover or focus me</Button>,
    tooltip: "This is a tooltip",
    placement: "bottom",
  },
};
