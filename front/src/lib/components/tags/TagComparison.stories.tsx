import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import type { PredictionTag, Tag } from "@/lib/types";

import TagComparison from "./TagComparison";

const meta: Meta<typeof TagComparison> = {
  title: "Tags/Comparison",
  component: TagComparison,
  args: {
    onClickTrueTag: fn(),
    onClickPredictedTag: fn(),
  },
};

export default meta;

function tag(name: string): Tag {
  return { key: "species", value: name };
}

function predictedTag(name: string, score: number): PredictionTag {
  return {
    score,
    created_on: new Date(),
    tag: { key: "species", value: name },
  };
}

type Story = StoryObj<typeof TagComparison>;

export const Empty: Story = {
  args: {
    tags: [],
    predictedTags: [],
  },
};

export const NoPredicted: Story = {
  args: {
    tags: [
      {
        key: "species",
        value: "Myotis myotis",
      },
    ],
    predictedTags: [],
  },
};

export const Correct: Story = {
  args: {
    tags: [
      {
        key: "species",
        value: "Myotis myotis",
      },
    ],
    predictedTags: [predictedTag("Myotis myotis", 0.8)],
  },
};

export const MultiplePredictions: Story = {
  args: {
    tags: [tag("Myotis myotis")],
    predictedTags: [
      predictedTag("Myotis alcathoe", 0.9),
      predictedTag("Myotis emarginatus", 0.8),
      predictedTag("Myotis myotis", 0.7),
      predictedTag("Myotis blythii", 0.6),
    ],
  },
};

export const MultipleTargets: Story = {
  args: {
    tags: [tag("Myotis myotis"), tag("Myotis alcathoe")],
    predictedTags: [
      predictedTag("Myotis alcathoe", 0.9),
      predictedTag("Myotis emarginatus", 0.8),
      predictedTag("Myotis myotis", 0.7),
      predictedTag("Myotis blythii", 0.6),
    ],
  },
};

export const MultipleTargetsIncorrectPredictions: Story = {
  args: {
    tags: [tag("Myotis myotis"), tag("Myotis alcathoe")],
    predictedTags: [
      predictedTag("Myotis bechsteinii", 0.9),
      predictedTag("Myotis emarginatus", 0.8),
      predictedTag("Myotis nattereri", 0.7),
      predictedTag("Myotis blythii", 0.6),
    ],
  },
};

export const AllWrongPredictionsAllScores: Story = {
  args: {
    tags: [],
    predictedTags: [
      predictedTag("Myotis myotis", 1),
      predictedTag("Myotis alcathoe", 0.9),
      predictedTag("Myotis ridleyi", 0.8),
      predictedTag("Myotis petax", 0.7),
      predictedTag("Myotis hoveli", 0.6),
      predictedTag("Myotis bechsteinii", 0.5),
      predictedTag("Myotis emarginatus", 0.4),
      predictedTag("Myotis nattereri", 0.3),
      predictedTag("Myotis blythii", 0.2),
      predictedTag("Myotis daubentonii", 0.1),
    ],
  },
};

export const AllCorrectPredictionsAllScores: Story = {
  args: {
    tags: [
      tag("Myotis myotis"),
      tag("Myotis alcathoe"),
      tag("Myotis ridleyi"),
      tag("Myotis petax"),
      tag("Myotis hoveli"),
      tag("Myotis bechsteinii"),
      tag("Myotis emarginatus"),
      tag("Myotis nattereri"),
      tag("Myotis blythii"),
      tag("Myotis daubentonii"),
    ],
    predictedTags: [
      predictedTag("Myotis myotis", 1),
      predictedTag("Myotis alcathoe", 0.9),
      predictedTag("Myotis ridleyi", 0.8),
      predictedTag("Myotis petax", 0.7),
      predictedTag("Myotis hoveli", 0.6),
      predictedTag("Myotis bechsteinii", 0.5),
      predictedTag("Myotis emarginatus", 0.4),
      predictedTag("Myotis nattereri", 0.3),
      predictedTag("Myotis blythii", 0.2),
      predictedTag("Myotis daubentonii", 0.1),
    ],
  },
};

export const PredictedTagAboveThresholdNotTrue: Story = {
  args: {
    tags: [],
    predictedTags: [predictedTag("Myotis alcathoe", 0.6)],
    threshold: 0.5,
  },
};

export const PredictedTagBelowThresholdNotTrue: Story = {
  args: {
    tags: [],
    predictedTags: [predictedTag("Myotis alcathoe", 0.6)],
    threshold: 0.6,
  },
};
