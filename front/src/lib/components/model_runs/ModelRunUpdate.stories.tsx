import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import ModelRunUpdate from "./ModelRunUpdate";

const meta: Meta<typeof ModelRunUpdate> = {
  title: "ModelRun/Update",
  component: ModelRunUpdate,
};

export default meta;

type Story = StoryObj<typeof ModelRunUpdate>;

export const Primary: Story = {
  args: {
    onUpdate: fn(),
    modelRun: {
      uuid: "a1b2c3d4",
      name: "BirdNet",
      version: "v1.0.0",
      description: "A model for bird detection",
      created_on: new Date(),
    },
  },
};
