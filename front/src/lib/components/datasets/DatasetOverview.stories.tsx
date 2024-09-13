import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import DatasetOverview from "./DatasetOverview";

const meta: Meta<typeof DatasetOverview> = {
  title: "Dataset/Overview",
  component: DatasetOverview,
};

export default meta;

type Story = StoryObj<typeof DatasetOverview>;

export const Primary: Story = {
  args: {
    dataset: {
      uuid: "123",
      name: "Test Dataset",
      description: "This is a test dataset.",
      audio_dir: "/path/to/audio",
      recording_count: 0,
      created_on: new Date(),
    },
    onClickDatasetRecordings: fn(),
  },
};
