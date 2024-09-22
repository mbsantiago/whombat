import type { Meta, StoryObj } from "@storybook/react";

import RecordingHeader from "@/lib/components/recordings/RecordingHeader";

const meta: Meta<typeof RecordingHeader> = {
  title: "Recordings/Header",
  component: RecordingHeader,
};

export default meta;

type Story = StoryObj<typeof RecordingHeader>;

const recording = {
  path: "path/to/recording.wav",
  uuid: "uuid",
  hash: "hash",
  duration: 10,
  samplerate: 44100,
  channels: 1,
  time_expansion: 1,
  created_on: new Date(),
};

export const Primary: Story = {
  args: {
    recording,
  },
};

export const WithDate: Story = {
  args: {
    recording: {
      ...recording,
      date: new Date(),
    },
  },
};

export const WithTime: Story = {
  args: {
    recording: {
      time: "19:00:00",
      ...recording,
    },
  },
};

export const WithLocation: Story = {
  args: {
    recording: {
      latitude: 0,
      longitude: 0,
      ...recording,
    },
  },
};

export const FlacFile: Story = {
  args: {
    recording: {
      ...recording,
      path: "path/to/recording.flac",
    },
  },
};
