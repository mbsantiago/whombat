import type { Meta, StoryObj } from "@storybook/react";

import RecordingSpectrogram from "@/lib/components/recordings/RecordingSpectrogram";

const meta: Meta<typeof RecordingSpectrogram> = {
  title: "Recordings/Spectrogram",
  component: RecordingSpectrogram,
};

export default meta;

type Story = StoryObj<typeof RecordingSpectrogram>;

export const Primary: Story = {
  args: {
    samplerate: 44100,
    viewport: {
      time: { min: 0, max: 2 },
      freq: { min: 0, max: 22050 },
    },
    bounds: {
      time: { min: 0, max: 10 },
      freq: { min: 0, max: 22050 },
    },
  },
};
