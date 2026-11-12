import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import Select from "./Select";

const options = [
  { id: "one", label: "One", value: "one" },
  { id: "two", label: "Two", value: "two" },
  { id: "three", label: "Three", value: "three" },
];

const meta: Meta<typeof Select> = {
  title: "Inputs/Select",
  component: Select,
};

export default meta;

type Story = StoryObj<typeof Select>;

export const Primary: Story = {
  args: {
    label: "Choose an option",
    selected: options[0],
    options,
    placement: "bottom-start",
    onChange: fn(),
  },
};
