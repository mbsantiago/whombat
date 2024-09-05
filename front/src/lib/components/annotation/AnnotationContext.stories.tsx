import type { Meta, StoryObj } from "@storybook/react";

import AnnotationContext from "./AnnotationContext";

const meta: Meta<typeof AnnotationContext> = {
  title: "Annotation/Context",
  component: AnnotationContext,
};

export default meta;

type Story = StoryObj<typeof AnnotationContext>;

const baseRecording = {
  uuid: "1",
  path: "path/to/recording.wav",
  hash: "hash",
  duration: 1,
  channels: 1,
  samplerate: 44100,
  time_expansion: 1,
  created_on: new Date(),
};

export const Primary: Story = {
  args: {
    recording: baseRecording,
  },
};
