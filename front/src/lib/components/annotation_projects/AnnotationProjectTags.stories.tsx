import TagSearchBar from "@/lib/components/tags/TagSearchBar";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import AnnotationProjectTags from "./AnnotationProjectTags";

const meta: Meta<typeof AnnotationProjectTags> = {
  title: "AnnotationProject/Tags",
  component: AnnotationProjectTags,
  args: {
    onDeleteTag: fn(),
    TagSearchBar: (
      <TagSearchBar
        onSelectTag={fn()}
        tags={[
          { key: "species", value: "Myotis myotis" },
          { key: "species", value: "Tadarida brasiliensis" },
          { key: "species", value: "Eptesicus fuscus" },
          { key: "species", value: "Nyctalus noctula" },
          { key: "species", value: "Pipistrellus pipistrellus" },
          { key: "species", value: "Eumops perotis" },
        ]}
      />
    ),
  },
};

export default meta;

type Story = StoryObj<typeof AnnotationProjectTags>;

export const Empty: Story = {
  args: {
    annotationProject: {
      uuid: "1",
      name: "Project 1",
      description: "Annotation project 1",
      created_on: new Date(),
    },
  },
};

export const WithTags: Story = {
  args: {
    annotationProject: {
      uuid: "1",
      name: "Project 1",
      description: "Annotation project 1",
      created_on: new Date(),
      tags: [
        { key: "species", value: "Myotis lucifugus" },
        { key: "species", value: "Myotis septentrionalis" },
        { key: "event", value: "Echolocation" },
      ],
    },
  },
};
