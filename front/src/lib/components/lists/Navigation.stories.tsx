import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import Navigation from "./Navigation";

const meta: Meta<typeof Navigation> = {
  title: "List/Navigation",
  component: Navigation,
  args: {
    total: 100,
    onRandom: fn(),
    onNext: fn(),
    onPrev: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof Navigation>;

export const Primary: Story = {
  args: {
    index: 10,
    hasNext: true,
    hasPrev: true,
  },
};

export const NoItemSelected: Story = {
  args: {
    index: null,
    hasNext: true,
    hasPrev: true,
  },
};

export const NoNext: Story = {
  args: {
    index: 100,
    hasNext: false,
    hasPrev: true,
  },
};

export const NoPrev: Story = {
  args: {
    index: 1,
    hasNext: true,
    hasPrev: false,
  },
};
