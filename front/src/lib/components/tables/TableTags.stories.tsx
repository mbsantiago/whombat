import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import TableTags from "./TableTags";
import TagSearchBar, {
  type TagSearchBarProps,
} from "@/lib/components/tags/TagSearchBar";
import type { Tag } from "@/lib/types";

const meta: Meta<typeof TableTags> = {
  title: "Table/Tags",
  component: TableTags,
  parameters: {
    controls: {
      exclude: [
        "TagSearchBar",
        "tagColorFn",
        "onBlur",
        "onKeyDown",
        "placement",
        "autoPlacement",
      ],
    },
  },
};

export default meta;

type Story = StoryObj<typeof TableTags>;

const tags: Tag[] = [
  { key: "species", value: "Myotis myotis" },
  { key: "species", value: "Myotis blythii" },
  { key: "species", value: "Myotis capaccinii" },
  { key: "species", value: "Myotis emarginatus" },
];

const props = {
  onClickTag: fn(),
  onDeleteTag: fn(),
  onCreateTag: fn(),
  TagSearchBar: (props: TagSearchBarProps) => (
    <TagSearchBar tags={tags} {...props} />
  ),
};

export const Empty: Story = {
  args: {
    tags: [],
    ...props,
  },
};

export const WithTags: Story = {
  args: {
    tags: [
      {
        key: "species",
        value: "Myotis myotis",
      },
      {
        key: "event",
        value: "Echolocation",
      },
    ],
    ...props,
  },
};

// 20 random tags
const randomTags = Array(20)
  .fill(0)
  .map((_, i) => ({
    key: `tag${i}`,
    value: `value${i}`,
  }));

export const WithManyTags: Story = {
  args: {
    tags: randomTags,
    ...props,
  },
};
