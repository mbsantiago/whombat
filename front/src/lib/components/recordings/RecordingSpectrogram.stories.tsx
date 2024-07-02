import type { Meta, StoryObj } from "@storybook/react";
import { withActions } from "@storybook/addon-actions/decorator";

import RecordingSpectrogram from "@/lib/components/recordings/RecordingSpectrogram";

const meta: Meta<typeof RecordingSpectrogram> = {
  title: "Recordings/RecordingSpectrogram",
  parameters: {
    actions: { argTypesRegex: "^on.*" },
  },
  tags: ["autodocs"],
  component: RecordingSpectrogram,
  decorators: [withActions],
};

export default meta;

type Story = StoryObj<typeof RecordingSpectrogram>;

export const Primary: Story = {
  args: {
    recording: {
      uuid: "uuid",
      path: "path/to/recording",
      hash: "hash",
      duration: 10,
      samplerate: 44100,
      channels: 1,
      time_expansion: 1,
      created_on: new Date(),
    },
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
