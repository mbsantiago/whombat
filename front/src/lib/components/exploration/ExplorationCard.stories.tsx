import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import ExplorationCard from "./ExplorationCard";

const meta: Meta<typeof ExplorationCard> = {
  title: "Exploration/Card",
  component: ExplorationCard,
};

export default meta;

type Story = StoryObj<typeof ExplorationCard>;

export const Primary: Story = {
  args: {
    title: "Exploration Title",
    description: "A short description of the exploration.",
    onClick: fn(),
  },
};

export const WithAltButton: Story = {
  args: {
    title: "Exploration Title",
    description: "A short description of the exploration.",
    button: "Alt Button",
    onClick: fn(),
  },
};
