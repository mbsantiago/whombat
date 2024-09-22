import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import ClipAnnotationTags from "@/lib/components/clip_annotations/ClipAnnotationTags";
import TagSearchBar from "@/lib/components/tags/TagSearchBar";

import type { Tag } from "@/lib/types";

const meta: Meta<typeof ClipAnnotationTags> = {
  title: "ClipAnnotation/ClipAnnotationTags",
  component: ClipAnnotationTags,
  args: {
    onAddTag: fn(),
    onRemoveTag: fn(),
    TagSearchBar: (props) => <TagSearchBar tags={tags} {...props} />,
  },
};

export default meta;

type Story = StoryObj<typeof ClipAnnotationTags>;

export const Empty: Story = {
  args: {},
};

const tags: Tag[] = [
  { key: "animal", value: "bird" },
  { key: "animal", value: "dog" },
  { key: "animal", value: "cat" },
  { key: "animal", value: "bird" },
];

export const WithTags: Story = {
  args: {
    tags,
  },
};
