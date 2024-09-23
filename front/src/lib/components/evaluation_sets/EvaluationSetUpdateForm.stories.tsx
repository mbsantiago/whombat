import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import EvaluationSetUpdate from "./EvaluationSetUpdateForm";

const meta: Meta<typeof EvaluationSetUpdate> = {
  title: "EvaluationSet/Update",
  component: EvaluationSetUpdate,
};

export default meta;

type Story = StoryObj<typeof EvaluationSetUpdate>;

export const Primary: Story = {
  args: {
    evaluationSet: {
      uuid: "1",
      name: "Evaluation",
      description: "This is an evaluation set",
      task: "Clip Classification",
      created_on: new Date(),
    },
    onChange: fn(),
  },
};
