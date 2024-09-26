import type { Meta, StoryObj } from "@storybook/react";

import Evaluation from "./Evaluation";

const meta: Meta<typeof Evaluation> = {
  title: "Evaluation/Detail",
  component: Evaluation,
};

export default meta;

type Story = StoryObj<typeof Evaluation>;

export const Primary: Story = {
  args: {
    evaluation: {
      uuid: "evaluation-1",
      created_on: new Date(),
      score: 0.8,
      task: "Clip Classification",
    },
  },
};

export const WithMetrics: Story = {
  args: {
    evaluation: {
      uuid: "evaluation-1",
      created_on: new Date(),
      score: 0.8,
      task: "Clip Classification",
      metrics: [
        { name: "F1@0.5", value: 0.8 },
        { name: "mAP", value: 0.43 },
      ],
    },
  },
};
