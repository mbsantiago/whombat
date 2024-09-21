import SpectrogramSettings from "@/lib/components/settings/SpectrogramSettings";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof SpectrogramSettings> = {
  title: "Settings/SpectrogramsSettings",
  component: SpectrogramSettings,
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
