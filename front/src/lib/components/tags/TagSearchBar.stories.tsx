import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import TagSearchBar from "./TagSearchBar";
import type { Tag } from "@/lib/types";

const meta: Meta<typeof TagSearchBar> = {
  title: "Tags/TagSearchBar",
  component: TagSearchBar,
};

export default meta;

type Story = StoryObj<typeof TagSearchBar>;

export const Primary: Story = {
  args: {
    tags: [
      { key: "species", value: "Tadarida brasiliensis" },
      { key: "species", value: "Myotis myotis" },
      { key: "event", value: "Echolocation" },
    ] as Tag[],
    onSelectTag: fn(),
    onCreateTag: fn(),
    onQueryChange: fn(),
    canCreate: true,
  },
};
