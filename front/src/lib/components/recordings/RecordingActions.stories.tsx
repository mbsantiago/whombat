import RecordingActions from "@/lib/components/recordings/RecordingActions";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof RecordingActions> = {
  title: "Recordings/Actions",
  component: RecordingActions,
};

export default meta;

type Story = StoryObj<typeof RecordingActions>;

export const Primary: Story = {
  args: {},
};
