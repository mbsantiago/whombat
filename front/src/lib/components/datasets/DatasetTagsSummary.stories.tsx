import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import DatasetTagsSummary from "./DatasetTagsSummary";

const meta: Meta<typeof DatasetTagsSummary> = {
  title: "Dataset/TagsSummary",
  component: DatasetTagsSummary,
};

export default meta;

type Story = StoryObj<typeof DatasetTagsSummary>;

export const Primary: Story = {
  args: {
    tags: [
      {
        tag: { key: "key1", value: "value1" },
        created_on: new Date(),
        recording_uuid: "recording1",
      },
      {
        tag: { key: "key1", value: "value1" },
        created_on: new Date(),
        recording_uuid: "recording2",
      },
      {
        tag: { key: "key2", value: "value2" },
        created_on: new Date(),
        recording_uuid: "recording3",
      },
    ],
    onTagClick: fn(),
  },
};

export const Empty: Story = {
  args: {
    tags: [],
    onTagClick: fn(),
  },
};
