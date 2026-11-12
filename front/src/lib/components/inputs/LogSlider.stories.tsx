import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import LogSlider from "./LogSlider";

const meta: Meta<typeof LogSlider> = {
  title: "Inputs/LogSlider",
  component: LogSlider,
};

export default meta;

type Story = StoryObj<typeof LogSlider>;

export const Primary: Story = {
  args: {
    label: "Volume",
    orientation: "horizontal",
    isDisabled: false,
    onChangeEnd: fn(),
    onChange: fn(),
    minValue: -6,
    maxValue: 2,
    step: 0.01,
  },
};
