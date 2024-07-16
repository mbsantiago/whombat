import type { Meta, StoryObj } from "@storybook/react";

import ComboBox from "./ComboBox";

const meta: Meta<typeof ComboBox> = {
  title: "UI/ComboBox",
  component: ComboBox,
  argTypes: {
    children: {
      table: {
        disable: true,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof ComboBox>;

export const Primary: Story = {
  args: {
    label: "ComboBox",
  },
};
