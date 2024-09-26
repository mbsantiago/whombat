import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import EvaluationSetCreate from "./EvaluationSetCreate";

const meta: Meta<typeof EvaluationSetCreate> = {
  title: "EvaluationSet/Create",
  component: EvaluationSetCreate,
};

export default meta;

type Story = StoryObj<typeof EvaluationSetCreate>;

export const Primary: Story = {
  args: {
    onCreateEvaluationSet: fn(),
  },
};
