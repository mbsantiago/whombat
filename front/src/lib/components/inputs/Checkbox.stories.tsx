import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import Checkbox from "./Checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "Inputs/Checkbox",
  component: Checkbox,
};

export default meta;

type Story = StoryObj<typeof Checkbox>;

export const Checked: Story = {
  args: {
    checked: true,
    onChange: fn(),
  },
};

export const Unchecked: Story = {
  args: {
    checked: false,
    onChange: fn(),
  },
};

export const Indeterminate: Story = {
  args: {
    indeterminate: true,
    checked: false,
    onChange: fn(),
  },
};
