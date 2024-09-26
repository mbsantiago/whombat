import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import ModelRunActions from "./ModelRunActions";

const meta: Meta<typeof ModelRunActions> = {
  title: "ModelRun/Actions",
  component: ModelRunActions,
};

export default meta;

type Story = StoryObj<typeof ModelRunActions>;

export const Primary: Story = {
  args: {
    onDeleteModelRun: fn(),
    modelRun: {
      uuid: "a1b2c3d4",
      name: "BirdNet",
      version: "v1.0.0",
      description: "A model for bird detection",
      created_on: new Date(),
    },
  },
};
