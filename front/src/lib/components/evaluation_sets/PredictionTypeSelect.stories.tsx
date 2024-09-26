import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import PredictionTypeSelect from "./PredictionTypeSelect";

const meta: Meta<typeof PredictionTypeSelect> = {
  title: "EvaluationSet/PredictionTypes",
  component: PredictionTypeSelect,
};

export default meta;

type Story = StoryObj<typeof PredictionTypeSelect>;

export const Primary: Story = {
  args: {
    name: "prediction_type",
    onChange: fn(),
    onBlur: fn(),
  },
};
