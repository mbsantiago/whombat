import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { loremIpsum } from "lorem-ipsum";

import EvaluationSet from "./EvaluationSet";

const meta: Meta<typeof EvaluationSet> = {
  title: "EvaluationSet/Item",
  component: EvaluationSet,
  args: {
    onClickEvaluationSet: fn(),
    onClickEvaluationSetTag: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof EvaluationSet>;

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

export const WithLongDescription: Story = {
  args: {
    evaluationSet: {
      uuid: "1",
      name: "Evaluation Set 1",
      description: loremIpsum({ count: 5, units: "paragraphs" }),
      created_on: new Date(),
      task: "Sound Event Detection",
      tags: [{ key: "species", value: "Myotis myotis" }],
    },
  },
};
