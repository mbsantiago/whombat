import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import DatasetRecordingsSummary from "./DatasetRecordingsSummary";

const meta: Meta<typeof DatasetRecordingsSummary> = {
  title: "Dataset/RecordingsSummary",
  component: DatasetRecordingsSummary,
};

export default meta;

type Story = StoryObj<typeof DatasetRecordingsSummary>;

export const Primary: Story = {
  args: {
    dataset: {
      uuid: "1",
      name: "Test Dataset",
      description: "This is a test dataset.",
      audio_dir: "test-dataset",
      recording_count: 10,
      created_on: new Date(),
    },
    onDownloadDataset: fn(),
  },
};
