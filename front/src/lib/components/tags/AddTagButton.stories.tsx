import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import AddTagButton from "./AddTagButton";
import type { Tag } from "@/lib/types";

const meta: Meta<typeof AddTagButton> = {
  title: "Tags/AddTagButton",
  component: AddTagButton,
};

export default meta;

type Story = StoryObj<typeof AddTagButton>;

export const Primary: Story = {
  args: {
    tags: [
      { key: "species", value: "Tadarida brasiliensis" },
      { key: "species", value: "Myotis myotis" },
      { key: "event", value: "Echolocation" },
    ] as Tag[],
    onSelectTag: fn(),
    onCreateTag: fn(),
    onChangeQuery: fn(),
    canCreate: true,
    placement: "bottom-start",
  },
};
