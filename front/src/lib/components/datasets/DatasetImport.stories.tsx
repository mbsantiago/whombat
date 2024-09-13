import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import DatasetImport from "./DatasetImport";

const meta: Meta<typeof DatasetImport> = {
  title: "Dataset/Import",
  component: DatasetImport,
};

export default meta;

type Story = StoryObj<typeof DatasetImport>;

export const Primary: Story = {
  args: {
    onImportDataset: fn(),
  },
};
