import RecordingMediaInfo from "@/lib/components/recordings/RecordingMediaInfo";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof RecordingMediaInfo> = {
  title: "Recordings/MediaInfo",
  component: RecordingMediaInfo,
};

export default meta;

type Story = StoryObj<typeof RecordingMediaInfo>;

export const Primary: Story = {
  args: {
    recording: {
      uuid: "uuid",
      hash: "hash",
      path: "path.wav",
      duration: 10,
      samplerate: 44100,
      channels: 1,
      time_expansion: 1,
      created_on: new Date(),
    },
  },
};
