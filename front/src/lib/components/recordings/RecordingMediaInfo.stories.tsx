import type { Meta, StoryObj } from "@storybook/react";

import RecordingMediaInfo from "@/lib/components/recordings/RecordingMediaInfo";

const meta: Meta<typeof RecordingMediaInfo> = {
  title: "Recordings/RecordingMediaInfo",
  component: RecordingMediaInfo,
};

export default meta;

type Story = StoryObj<typeof RecordingMediaInfo>;

export const Primary: Story = {
  args: {
    duration: 10,
    samplerate: 44100,
    channels: 1,
    time_expansion: 1,
  },
};
