import type { Meta, StoryObj } from "@storybook/react";
import { withActions } from "@storybook/addon-actions/decorator";

import SpectrogramSettings from "@/lib/components/settings/SpectrogramSettings";

const meta: Meta<typeof SpectrogramSettings> = {
  title: "SpectrogramSettings",
  parameters: {
    actions: { argTypesRegex: "^on.*" },
  },
  tags: ["autodocs"],
  component: SpectrogramSettings,
  decorators: [withActions],
};

export default meta;

type Story = StoryObj<typeof SpectrogramSettings>;

export const Primary: Story = {
  args: {
    settings: {
      window_size: 1024,
      overlap: 256,
      window: "hann",
      scale: "dB",
      clamp: false,
      min_dB: -80,
      max_dB: 0,
      normalize: true,
      pcen: false,
      cmap: "viridis",
    },
    samplerate: 44100,
  },
};
