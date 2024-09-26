import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import DatasetExport from "./DatasetExport";

const meta: Meta<typeof DatasetExport> = {
  title: "Dataset/Export",
  component: DatasetExport,
};

export default meta;

type Story = StoryObj<typeof DatasetExport>;

export const Primary: Story = {
  args: {
    onDownloadDataset: fn(),
  },
};
