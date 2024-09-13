import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import DatasetCreate from "./DatasetCreate";

const meta: Meta<typeof DatasetCreate> = {
  title: "Dataset/Create",
  component: DatasetCreate,
};

export default meta;

type Story = StoryObj<typeof DatasetCreate>;

export const Primary: Story = {
  args: {
    onCreateDataset: fn(),
  },
};
