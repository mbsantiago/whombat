import TagSearchBar from "@/lib/components/tags/TagSearchBar";
import type { Tag } from "@/lib/types";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import SelectedMenu from "./SelectedMenu";

const meta: Meta<typeof SelectedMenu> = {
  title: "Table/SelectedMenu",
  component: SelectedMenu,
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

type Story = StoryObj<typeof SelectedMenu>;

const tags: Tag[] = [
  { key: "species", value: "Myotis myotis" },
  { key: "species", value: "Myotis blythii" },
  { key: "species", value: "Myotis capaccinii" },
  { key: "species", value: "Myotis emarginatus" },
];

export const Primary: Story = {
  args: {
    numSelected: 10,
    onTagSelected: fn(),
    onDeleteSelected: fn(),
    onCreateTag: fn(),
    TagSearchBar: (props) => <TagSearchBar tags={tags} {...props} />,
  },
};
