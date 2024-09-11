import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import RecordingDate from "@/lib/components/recordings/RecordingDate";

const meta: Meta<typeof RecordingDate> = {
  title: "Recordings/Date",
  component: RecordingDate,
};

export default meta;

type Story = StoryObj<typeof RecordingDate>;

export const Primary: Story = {
  args: {
    date: new Date("2021-01-01"),
    onChange: fn(),
  },
};

export const NoDate: Story = {
  args: {
    onChange: fn(),
  },
};

export const Disabled: Story = {
  args: {
    date: new Date("2021-01-01"),
    onChange: fn(),
    disabled: true,
  },
};
