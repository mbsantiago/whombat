import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import EvaluationSetActions from "./EvaluationSetActions";

const meta: Meta<typeof EvaluationSetActions> = {
  title: "EvaluationSet/Actions",
  component: EvaluationSetActions,
  args: {
    onDownload: fn(),
    onDelete: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof EvaluationSetActions>;

export const Primary: Story = {
  args: {
    evaluationSet: {
      uuid: "1",
      name: "Evaluation Set 1",
      description: "This is a description",
      created_on: new Date(),
      task: "Clip Classification",
      tags: [{ key: "species", value: "Myotis myotis" }],
    },
  },
};
