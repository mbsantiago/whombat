import type { Meta, StoryObj } from "@storybook/react";

import Hero from "./Hero";

const meta: Meta<typeof Hero> = {
  title: "UI/Hero",
  component: Hero,
};

export default meta;

type Story = StoryObj<typeof Hero>;

export const Primary: Story = {
  args: {
    text: "Hero",
  },
};
