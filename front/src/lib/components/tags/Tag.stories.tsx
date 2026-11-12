import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Tag from "./Tag";

const meta: Meta<typeof Tag> = {
  title: "Tags/Tag",
  component: Tag,
};

export default meta;

type Story = StoryObj<typeof Tag>;

export const Primary: Story = {
  args: {
    tag: {
      key: "key",
      value: "value",
    },
    color: "yellow",
    level: 4,
  },
};
