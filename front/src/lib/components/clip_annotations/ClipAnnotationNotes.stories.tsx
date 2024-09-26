import type { Meta, StoryObj } from "@storybook/react";

import ClipAnnotationNotes from "@/lib/components/clip_annotations/ClipAnnotationNotes";

const meta: Meta<typeof ClipAnnotationNotes> = {
  title: "ClipAnnotation/ClipAnnotationNotes",
  component: ClipAnnotationNotes,
};

export default meta;

type Story = StoryObj<typeof ClipAnnotationNotes>;

export const Empty: Story = {
  args: {},
};

export const WithNotes: Story = {
  args: {
    notes: [
      {
        uuid: "note-1",
        message: "This is a note",
        is_issue: false,
        created_on: new Date(),
      },
      {
        uuid: "note-2",
        message: "This is an issue",
        is_issue: true,
        created_on: new Date(),
      },
    ],
  },
};
