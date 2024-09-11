import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import RecordingTagBar from "@/lib/components/recordings/RecordingTagBar";
import TagSearchBar from "@/lib/components/tags/TagSearchBar";

const meta: Meta<typeof RecordingTagBar> = {
  title: "Recordings/RecordingTagBar",
  component: RecordingTagBar,
};

export default meta;

type Story = StoryObj<typeof RecordingTagBar>;

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
    tags: [{ key: "tag1", value: "value1" }],
    onAddTag: fn(),
    onCreateTag: fn(),
    TagSearchBar: ({ close, ...props }) => (
      <TagSearchBar
        tags={tags}
        onKeyDown={(event) => {
          if (event.code == "Escape") {
            close();
          }
        }}
        {...props}
      />
    ),
  },
};

export const NoTags: Story = {
  args: {
    tags: [],
    onAddTag: fn(),
    onCreateTag: fn(),
    TagSearchBar: ({ close, ...props }) => (
      <TagSearchBar
        tags={tags}
        onKeyDown={(event) => {
          if (event.code == "Escape") {
            close();
          }
        }}
        {...props}
      />
    ),
  },
};

export const ManyTags: Story = {
  args: {
    tags: [
      { key: "tag1", value: "value1" },
      { key: "tag2", value: "value2" },
      { key: "tag3", value: "value3" },
      { key: "tag4", value: "value4" },
      { key: "tag1", value: "value5" },
      { key: "tag1", value: "value6" },
      { key: "tag1", value: "value7" },
    ],
    onAddTag: fn(),
    onCreateTag: fn(),
    TagSearchBar: ({ close, ...props }) => (
      <TagSearchBar
        tags={tags}
        onKeyDown={(event) => {
          if (event.code == "Escape") {
            close();
          }
        }}
        {...props}
      />
    ),
  },
};
