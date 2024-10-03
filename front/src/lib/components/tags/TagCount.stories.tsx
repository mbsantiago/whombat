import type { Meta, StoryObj } from "@storybook/react";

import TagCount from "./TagCount";

const meta: Meta<typeof TagCount> = {
  title: "Tags/Count",
  component: TagCount,
};

export default meta;

function randomString(length: number) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

type Story = StoryObj<typeof TagCount>;

export const Primary: Story = {
  args: {
    tagCount: [
      {
        tag: { key: "key1", value: "value1" },
        count: 10,
      },
      {
        tag: { key: "key2", value: "value2" },
        count: 20,
      },
      {
        tag: { key: "key3", value: "value3" },
        count: 30,
      },
    ],
  },
};

export const ManyTags: Story = {
  args: {
    tagCount: Array.from({ length: 100 }, () => ({
      tag: { key: randomString(5), value: randomString(5) },
      count: Math.floor(Math.random() * 100),
    })),
  },
};
