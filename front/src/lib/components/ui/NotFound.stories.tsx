import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import NotFound from "./NotFound";

const meta: Meta<typeof NotFound> = {
  title: "UI/NotFound",
  component: NotFound,
};

export default meta;

type Story = StoryObj<typeof NotFound>;

export const Primary: Story = {
  args: {
    onGoHome: fn(),
  },
};
