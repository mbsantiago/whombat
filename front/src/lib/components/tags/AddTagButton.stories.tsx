import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import TagSearchBar from "@/lib/components/tags/TagSearchBar";
import AddTagButton from "./AddTagButton";

const meta: Meta<typeof AddTagButton> = {
  title: "Tags/AddTagButton",
  component: AddTagButton,
};

export default meta;

type Story = StoryObj<typeof AddTagButton>;

const tags = [
  { key: "tag1", value: "value1" },
  { key: "tag2", value: "value2" },
  { key: "tag3", value: "value3" },
  { key: "tag4", value: "value4" },
  { key: "tag1", value: "value5" },
  { key: "tag1", value: "value6" },
  { key: "tag1", value: "value7" },
];

export const Primary: Story = {
  args: {
    TagSearchBar: (props) => (
      <TagSearchBar tags={tags} placement="bottom-start" {...props} />
    ),
    onSelectTag: fn(),
    onCreateTag: fn(),
    placement: "bottom-start",
  },
};
