import type { Meta, StoryObj } from "@storybook/react";

import RecordingActions from "@/lib/components/recordings/RecordingActions";

const meta: Meta<typeof RecordingActions> = {
  title: "Recordings/Actions",
  component: RecordingActions,
};

export default meta;

type Story = StoryObj<typeof RecordingActions>;

export const Primary: Story = {
  args: {},
};
