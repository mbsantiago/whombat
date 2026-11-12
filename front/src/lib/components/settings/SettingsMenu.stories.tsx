import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import SettingsMenu from "@/lib/components/settings/SettingsMenu";

const meta: Meta<typeof SettingsMenu> = {
  title: "Settings/SettingsMenu",
  component: SettingsMenu,
};

export default meta;

type Story = StoryObj<typeof SettingsMenu>;

export const Primary: Story = {
  args: {
    spectrogramSettings: {
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
    audioSettings: {
      resample: false,
      samplerate: 44100,
      low_freq: 0,
      high_freq: 22050,
      filter_order: 4,
      channel: 0,
      speed: 1,
    },
    viewSettings: {
      duration: 1,
      min_freq: 0,
      max_freq: null,
    },
    samplerate: 44100,
  },
};
