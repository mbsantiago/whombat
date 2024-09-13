import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import DatasetNotesSummary from "./DatasetNotesSummary";

const meta: Meta<typeof DatasetNotesSummary> = {
  title: "Dataset/NotesSummary",
  component: DatasetNotesSummary,
};

export default meta;

type Story = StoryObj<typeof DatasetNotesSummary>;

export const Empty: Story = {
  args: {
    notes: [],
    onClickNote: fn(),
  },
};

export const WithNotes: Story = {
  args: {
    notes: [
      {
        uuid: "note1",
        message: "This is a test note.",
        is_issue: false,
        created_on: new Date(),
      },
      {
        uuid: "note2",
        message: "This is another test note.",
        is_issue: false,
        created_on: new Date(),
      },
    ],
    onClickNote: fn(),
  },
};

export const WithIssues: Story = {
  args: {
    notes: [
      {
        uuid: "note1",
        message: "This is a test note.",
        is_issue: false,
        created_on: new Date(),
      },
      {
        uuid: "note2",
        message: "This is another test note.",
        is_issue: true,
        created_on: new Date(),
      },
    ],
    onClickNote: fn(),
  },
};
