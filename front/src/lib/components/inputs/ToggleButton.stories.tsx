import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import ToggleButton from "./ToggleButton";

const meta: Meta<typeof ToggleButton> = {
  title: "Inputs/ToggleButton",
  component: ToggleButton,
  args: {
    onChange: fn(),
    onClear: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof ToggleButton>;

export const Yes: Story = {
  args: {
    checked: true,
  },
};

export const No: Story = {
  args: {
    checked: false,
  },
};

export const Unset: Story = {
  args: {
    checked: undefined,
  },
};
