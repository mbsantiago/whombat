import type { Meta, StoryObj } from "@storybook/react";

import RecordingMap from "@/lib/components/recordings/RecordingMap";

import type { Recording } from "@/lib/types";

const meta: Meta<typeof RecordingMap> = {
  title: "Recordings/Map",
  component: RecordingMap,
};

export default meta;

type Story = StoryObj<typeof RecordingMap>;

const recording: Recording = {
  uuid: "recording-uuid",
  path: "path/to/recording.wav",
  hash: "recording-hash",
  duration: 10,
  samplerate: 44100,
  channels: 1,
  time_expansion: 1,
  created_on: new Date(),
};

export const Primary: Story = {
  args: {
    recording: {
      ...recording,
      latitude: 51.5072,
      longitude: -0.1276,
    },
  },
};

export const WithoutLocation: Story = {
  args: {
    recording,
  },
};
