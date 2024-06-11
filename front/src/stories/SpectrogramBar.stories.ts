import type { Meta, StoryObj } from "@storybook/react";
import { withActions } from "@storybook/addon-actions/decorator";

import SpectrogramBar from "@/components/spectrograms/SpectrogramBar";

const meta: Meta<typeof SpectrogramBar> = {
  title: "SpectrogramBar",
  parameters: {
    actions: { argTypesRegex: "^on.*" },
  },
  tags: ["autodocs"],
  component: SpectrogramBar,
  decorators: [withActions],
};

export default meta;

type Story = StoryObj<typeof SpectrogramBar>;

export const Primary: Story = {
  args: {
    bounds: {
      time: { min: 0, max: 1 },
      freq: { min: 0, max: 1 },
    },
    viewport: {
      time: { min: 0, max: 0.2 },
      freq: { min: 0, max: 0.5 },
    },
  },
};
