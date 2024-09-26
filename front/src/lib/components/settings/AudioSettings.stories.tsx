import type { Meta, StoryObj } from "@storybook/react";

import AudioSettings from "@/lib/components/settings/AudioSettings";

const meta: Meta<typeof AudioSettings> = {
  title: "Settings/AudioSettings",
  component: AudioSettings,
};

export default meta;

type Story = StoryObj<typeof AudioSettings>;

export const Primary: Story = {
  args: {
    settings: {
      resample: false,
      samplerate: 44100,
      low_freq: 0,
      high_freq: 22050,
      filter_order: 4,
      channel: 0,
      speed: 1,
    },
    samplerate: 44100,
  },
};
