import type { Meta, StoryObj } from "@storybook/react";
import { withActions } from "@storybook/addon-actions/decorator";

import AudioSettings from "@/components/settings/AudioSettings";

const meta: Meta<typeof AudioSettings> = {
  title: "AudioSettings",
  parameters: {
    actions: { argTypesRegex: "^on.*" },
  },
  tags: ["autodocs"],
  component: AudioSettings,
  decorators: [withActions],
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
