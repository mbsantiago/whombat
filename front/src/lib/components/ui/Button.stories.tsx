import type { Meta, StoryObj } from "@storybook/react";

import { CheckIcon } from "@/lib/components/icons";

import Button from "./Button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: "Button",
  },
};

export const Secondary: Story = {
  args: {
    children: "Button",
    variant: "secondary",
  },
};

export const Danger: Story = {
  args: {
    children: "Button",
    variant: "danger",
  },
};

export const Success: Story = {
  args: {
    children: "Button",
    variant: "success",
  },
};

export const Warning: Story = {
  args: {
    children: "Button",
    variant: "warning",
  },
};

export const Info: Story = {
  args: {
    children: "Button",
    variant: "info",
  },
};

export const Outline: Story = {
  args: {
    children: "Button",
    mode: "outline",
  },
};

export const Text: Story = {
  args: {
    children: "Button",
    mode: "text",
  },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <CheckIcon className="w-4 h-4" /> With Icon
      </>
    ),
    mode: "text",
  },
};
