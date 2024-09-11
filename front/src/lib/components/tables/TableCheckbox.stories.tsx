import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import TableCheckbox from "./TableCheckbox";

const meta: Meta<typeof TableCheckbox> = {
  title: "Table/Checkbox",
  component: TableCheckbox,
};

export default meta;

type Story = StoryObj<typeof TableCheckbox>;

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
