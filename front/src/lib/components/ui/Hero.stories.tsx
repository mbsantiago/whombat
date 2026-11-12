import type { Meta, StoryObj } from "@storybook/nextjs-vite";

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
