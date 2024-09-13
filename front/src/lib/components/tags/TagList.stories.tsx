import type { Meta, StoryObj } from "@storybook/react";

import TagList from "./TagList";

const meta: Meta<typeof TagList> = {
  title: "Tags/List",
  component: TagList,
};

export default meta;

type Story = StoryObj<typeof TagList>;

export const Primary: Story = {
  args: {
    tags: [
      {
        key: "key",
        value: "value",
      },
    ],
  },
};

export const Empty: Story = {
  args: {
    tags: [],
  },
};

const tags = Array.from({ length: 100 }, (_, i) => ({
  key: `key-${i}`,
  value: `value-${i}`,
}));

export const Many: Story = {
  args: {
    tags: tags,
  },
};
