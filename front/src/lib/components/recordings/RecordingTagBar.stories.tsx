import type { Meta, StoryObj } from "@storybook/react";

import RecordingTagBar from "@/lib/components/recordings/RecordingTagBar";

const meta: Meta<typeof RecordingTagBar> = {
  title: "Recordings/RecordingTagBar",
  component: RecordingTagBar,
};

export default meta;

type Story = StoryObj<typeof RecordingTagBar>;

export const Primary: Story = {
  args: {
    tags: [{ key: "tag1", value: "value1" }],
  },
};

export const NoTags: Story = {
  args: {
    tags: [],
  },
};

export const ManyTags: Story = {
  args: {
    tags: [
      { key: "tag1", value: "value1" },
      { key: "tag2", value: "value2" },
      { key: "tag3", value: "value3" },
      { key: "tag4", value: "value4" },
      { key: "tag1", value: "value5" },
      { key: "tag1", value: "value6" },
      { key: "tag1", value: "value7" },
    ],
  },
};
