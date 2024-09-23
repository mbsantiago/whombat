import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import ModelRunItem from "./ModelRunItem";

const meta: Meta<typeof ModelRunItem> = {
  title: "ModelRun/Item",
  component: ModelRunItem,
};

export default meta;

type Story = StoryObj<typeof ModelRunItem>;

export const Primary: Story = {
  args: {
    onClick: fn(),
    modelRun: {
      uuid: "123",
      name: "BirdNET",
      version: "1.0.0",
      created_on: new Date(),
    },
  },
};
