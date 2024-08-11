import type { Meta, StoryObj } from "@storybook/react";

import KeyboardKey from "./KeyboardKey";

const meta: Meta<typeof KeyboardKey> = {
  title: "UI/KeyboardKey",
  component: KeyboardKey,
};

export default meta;

type Story = StoryObj<typeof KeyboardKey>;

export const Primary: Story = {
  args: {
    keys: ["a"],
  },
};

export const WithAlt: Story = {
  args: {
    keys: ["a"],
    alt: true,
  },
};

export const WithCtrl: Story = {
  args: {
    keys: ["a"],
    alt: false,
    ctrl: true,
  },
};

export const WithMeta: Story = {
  args: {
    keys: ["a"],
    alt: false,
    ctrl: false,
    meta: true,
  },
};

export const WithShift: Story = {
  args: {
    keys: ["a"],
    alt: false,
    ctrl: false,
    meta: false,
    shift: true,
  },
};

export const WithCtrlAndShift: Story = {
  args: {
    keys: ["a"],
    alt: false,
    ctrl: true,
    meta: false,
    shift: true,
  },
};
