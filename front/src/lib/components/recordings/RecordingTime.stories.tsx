import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import RecordingTime from "@/lib/components/recordings/RecordingTime";

const meta: Meta<typeof RecordingTime> = {
  title: "Recordings/Time",
  component: RecordingTime,
};

export default meta;

type Story = StoryObj<typeof RecordingTime>;

export const Primary: Story = {
  args: {
    time: "20:10:50",
    onChange: fn(),
  },
};

export const NoTime: Story = {
  args: {
    onChange: fn(),
  },
};

export const Disabled: Story = {
  args: {
    time: "10:00:00",
    onChange: fn(),
    disabled: true,
  },
};
