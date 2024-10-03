import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import DatasetUpdateComponent from "./DatasetUpdate";

const meta: Meta<typeof DatasetUpdateComponent> = {
  title: "Dataset/Update",
  component: DatasetUpdateComponent,
};

export default meta;

type Story = StoryObj<typeof DatasetUpdateComponent>;

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
    onChangeDataset: fn(),
  },
};
