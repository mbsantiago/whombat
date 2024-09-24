import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import ModelRunImport from "./ModelRunImport";

const meta: Meta<typeof ModelRunImport> = {
  title: "ModelRun/Import",
  component: ModelRunImport,
};

export default meta;

type Story = StoryObj<typeof ModelRunImport>;

export const Primary: Story = {
  args: {
    onImportModelRun: fn(),
  },
};
