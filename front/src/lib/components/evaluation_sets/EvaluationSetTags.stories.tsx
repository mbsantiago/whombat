import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import TagSearchBar from "@/lib/components/tags/TagSearchBar";

import EvaluationSetTags from "./EvaluationSetTags";

const meta: Meta<typeof EvaluationSetTags> = {
  title: "EvaluationSet/Tags",
  component: EvaluationSetTags,
  args: {
    onDeleteTag: fn(),
    TagSearchBar: (
      <TagSearchBar
        tags={[
          { key: "species", value: "Myotis myotis" },
          { key: "species", value: "Myotis blythii" },
        ]}
      />
    ),
  },
};

export default meta;

type Story = StoryObj<typeof EvaluationSetTags>;

export const Empty: Story = {
  args: {
    tags: [],
  },
};

export const WithTags: Story = {
  args: {
    tags: [
      { key: "species", value: "Myotis myotis" },
      { key: "species", value: "Myotis blythii" },
      { key: "species", value: "Myotis capaccinii" },
    ],
  },
};
