import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import ModelEvaluationSummary from "./ModelEvaluationSummary";

const meta: Meta<typeof ModelEvaluationSummary> = {
  title: "EvaluationSet/ModelEvaluationSummary",
  component: ModelEvaluationSummary,
};

export default meta;

type Story = StoryObj<typeof ModelEvaluationSummary>;

export const Empty: Story = {
  args: {
    modelRuns: [],
    onClickModelRun: fn(),
    onAddModelRuns: fn(),
  },
};

export const WithModelRuns: Story = {
  args: {
    modelRuns: [
      {
        uuid: "123",
        name: "BirdNET",
        version: "1.0.0",
        created_on: new Date(),
      },
      {
        uuid: "81238",
        name: "BirdNET",
        version: "1.2.0",
        created_on: new Date(),
      },
      {
        uuid: "234823",
        name: "Perch",
        version: "1.0.3",
        created_on: new Date(),
      },
    ],
    onClickModelRun: fn(),
    onAddModelRuns: fn(),
  },
};
