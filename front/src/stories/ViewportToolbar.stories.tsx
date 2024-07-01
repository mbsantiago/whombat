import type { Meta, StoryObj } from "@storybook/react";
import { withActions } from "@storybook/addon-actions/decorator";

import ViewportToolbar from "@/components/spectrograms/ViewportToolbar";

const meta: Meta<typeof ViewportToolbar> = {
  title: "ViewportToolbar",
  parameters: {
    actions: { argTypesRegex: "^on.*" },
  },
  tags: ["autodocs"],
  component: ViewportToolbar,
  decorators: [withActions],
};

export default meta;

type Story = StoryObj<typeof ViewportToolbar>;

export const Primary: Story = {
  args: {
    state: "idle",
  },
};

export const Panning: Story = {
  args: {
    state: "panning",
  },
};

export const Zooming: Story = {
  args: {
    state: "zooming",
  },
};
