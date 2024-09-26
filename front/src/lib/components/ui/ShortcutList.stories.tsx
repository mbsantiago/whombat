import type { Meta, StoryObj } from "@storybook/react";

import ShortcutsList from "./ShortcutList";

const meta: Meta<typeof ShortcutsList> = {
  title: "UI/ShortcutList",
  component: ShortcutsList,
};

export default meta;

type Story = StoryObj<typeof ShortcutsList>;

export const Primary: Story = {
  args: {
    shortcuts: [
      { keys: ["space"], description: "Toggle playing" },
      { keys: ["z"], description: "Enable zoom" },
      { keys: ["b"], description: "Go back to previous viewport" },
      { keys: ["x"], description: "Enable dragging" },
    ],
  },
};

export const WithCombinedKeys: Story = {
  args: {
    shortcuts: [
      { keys: ["shift", "space"], description: "Toggle loop" },
      { keys: ["shift", "z"], description: "Reset zoom" },
      { keys: ["shift", "b"], description: "Go back to previous viewport" },
      { keys: ["shift", "x"], description: "Reset dragging" },
    ],
  },
};

export const WithModifierKeys: Story = {
  args: {
    shortcuts: [
      { keys: ["a"], description: "Action A" },
      { keys: ["a"], ctrl: true, description: "Action B" },
      { keys: ["a"], shift: true, description: "Action C" },
      { keys: ["a"], alt: true, description: "Action D" },
      { keys: ["a"], meta: true, description: "Action E" },
    ],
  },
};
