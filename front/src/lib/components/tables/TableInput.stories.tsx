import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import TableInput from "./TableInput";

const meta: Meta<typeof TableInput> = {
  title: "Table/Input",
  component: TableInput,
};

export default meta;

type Story = StoryObj<typeof TableInput>;

export const Primary: Story = {
  args: {
    value: "Hello World",
    onChange: fn(),
  },
};
