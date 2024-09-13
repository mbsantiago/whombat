import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import CreateNote from "./CreateNote";

const meta: Meta<typeof CreateNote> = {
  title: "Notes/Create",
  component: CreateNote,
};

export default meta;

type Story = StoryObj<typeof CreateNote>;

export const Primary: Story = {
  args: {
    onCreateNote: fn(),
  },
};
