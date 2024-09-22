import type { Meta, StoryObj } from "@storybook/react";

import ViewportToolbar from "@/lib/components/spectrograms/ViewportToolbar";

const meta: Meta<typeof ViewportToolbar> = {
  title: "Spectrograms/ViewportToolbar",
  component: ViewportToolbar,
};

export default meta;

type Story = StoryObj<typeof ViewportToolbar>;

export const Primary: Story = {
  args: {
    mode: "idle",
  },
};

export const Panning: Story = {
  args: {
    mode: "panning",
  },
};

export const Zooming: Story = {
  args: {
    mode: "zooming",
  },
};
