import type { Meta, StoryObj } from "@storybook/nextjs";
import { fn } from "storybook/test";

import ErrorToast from "./ErrorToast";

const meta: Meta<typeof ErrorToast> = {
  title: "UI/ErrorToast",
  component: ErrorToast,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    onShowDetails: fn(),
    onCopy: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof ErrorToast>;

export const Default: Story = {
  args: {
    message: "An unexpected error occurred. Please try again later.",
  },
};
