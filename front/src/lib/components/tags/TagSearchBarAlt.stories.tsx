import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import TagSearchBarAltComponent from "./TagSearchBarAlt";

const meta: Meta<typeof TagSearchBarAltComponent> = {
  title: "Tags/TagSearchBarAlt",
  component: TagSearchBarAltComponent,
};

export default meta;

type Story = StoryObj<typeof TagSearchBarAltComponent>;

export const Primary: Story = {
  args: {
    onQueryChange: fn(),
  },
};
