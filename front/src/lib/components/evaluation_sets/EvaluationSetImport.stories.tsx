import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import EvaluationSetImport from "./EvaluationSetImport";

const meta: Meta<typeof EvaluationSetImport> = {
  title: "EvaluationSet/Import",
  component: EvaluationSetImport,
};

export default meta;

type Story = StoryObj<typeof EvaluationSetImport>;

export const Primary: Story = {
  args: {
    onImportEvaluationSet: fn(),
  },
};
