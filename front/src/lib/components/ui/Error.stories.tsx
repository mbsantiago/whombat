import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import ErrorComponent from "./Error";

const meta: Meta<typeof ErrorComponent> = {
  title: "UI/Error",
  component: ErrorComponent,
};

export default meta;

type Story = StoryObj<typeof ErrorComponent>;

export const Primary: Story = {
  args: {
    onGoHome: fn(),
    onReset: fn(),
  },
};

export const WithError: Story = {
  args: {
    error: new Error("An error occurred"),
    onGoHome: fn(),
    onReset: fn(),
  },
};
