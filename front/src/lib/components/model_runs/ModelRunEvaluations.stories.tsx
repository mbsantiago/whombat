import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import type { EvaluationSet, ModelRun } from "@/lib/types";

import ModelRunEvaluation from "./ModelRunEvaluations";

const modelRun: ModelRun = {
  uuid: "a1b2c3d4",
  name: "BirdNet",
  version: "v1.0.0",
  description: "A model for bird detection",
  created_on: new Date(),
};

const evaluationSet: EvaluationSet = {
  uuid: "a1b2c3d4",
  name: "Birds of Norway 2021",
  created_on: new Date(),
  task: "Clip Classification",
};

const meta: Meta<typeof ModelRunEvaluation> = {
  title: "ModelRun/Evaluation",
  component: ModelRunEvaluation,
  args: {
    modelRun,
    evaluationSet,
    onEvaluate: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof ModelRunEvaluation>;

export const Empty: Story = {
  args: {},
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const WithEvaluation: Story = {
  args: {
    evaluation: {
      uuid: "a1b2c3d4",
      created_on: new Date(),
      task: "Clip Classification",
      score: 0.85,
    },
  },
};
