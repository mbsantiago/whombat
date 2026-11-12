import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import Slider from "./Slider";

const meta: Meta<typeof Slider> = {
  title: "Inputs/Slider",
  component: Slider,
};

export default meta;

type Story = StoryObj<typeof Slider>;

export const Primary: Story = {
  args: {
    label: "Volume",
    orientation: "horizontal",
    isDisabled: false,
    onChangeEnd: fn(),
    minValue: 0,
    maxValue: 100,
    step: 1,
  },
};
