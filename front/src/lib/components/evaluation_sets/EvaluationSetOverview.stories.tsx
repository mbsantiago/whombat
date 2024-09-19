import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import EvaluationSetOverview from "./EvaluationSetOverview";
import type { EvaluationSet } from "@/lib/types";

const evaluationSet: EvaluationSet = {
  uuid: "1",
  name: "Evaluation Set 1",
  description: "This is a description",
  created_on: new Date(),
  task: "Clip Classification",
};

const meta: Meta<typeof EvaluationSetOverview> = {
  title: "EvaluationSet/Overview",
  component: EvaluationSetOverview,
  args: {
    evaluationSet,
    onClickAddTags: fn(),
    onClickAddExamples: fn(),
    onClickModelRunsBadge: fn(),
    onClickClassesBadge: fn(),
    onClickExamplesBadge: fn(),
    onClickTrainingSessionsBadge: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof EvaluationSetOverview>;

export const Empty: Story = {
  args: {},
};

export const WithTags: Story = {
  args: {
    evaluationSet: {
      ...evaluationSet,
      tags: [{ key: "species", value: "Myotis myotis" }],
    },
  },
};

export const WithExamples: Story = {
  args: {
    evaluationSet: {
      ...evaluationSet,
      tags: [{ key: "species", value: "Myotis myotis" }],
    },
    numExamples: 10,
  },
};

export const WithAll: Story = {
  args: {
    evaluationSet: {
      ...evaluationSet,
      tags: [{ key: "species", value: "Myotis myotis" }],
    },
    numExamples: 1000,
    numModelRuns: 5,
    numTrainingSessions: 2,
  },
};
