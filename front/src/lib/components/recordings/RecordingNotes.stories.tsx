import type { Meta, StoryObj } from "@storybook/react";

import RecordingNotes from "@/lib/components/recordings/RecordingNotes";

const meta: Meta<typeof RecordingNotes> = {
  title: "Recordings/RecordingNotes",
  component: RecordingNotes,
};

export default meta;

type Story = StoryObj<typeof RecordingNotes>;

const user = {
  id: "user",
  username: "user",
  email: "user@whombat.com",
};

export const Primary: Story = {
  args: {
    currentUser: user,
    notes: [
      {
        uuid: "uuid",
        created_on: new Date(),
        message: "This is a note",
        is_issue: false,
        created_by: user,
      },
    ],
  },
};

export const NoNotes: Story = {
  args: {
    notes: [],
  },
};

export const NotesWithIssues: Story = {
  args: {
    currentUser: user,
    notes: [
      {
        uuid: "uuid",
        created_on: new Date(),
        message: "This is an issue",
        is_issue: true,
        created_by: user,
      },
      {
        uuid: "uuid",
        created_on: new Date(),
        message: "This is a note",
        is_issue: false,
        created_by: user,
      },
      {
        uuid: "uuid",
        created_on: new Date(),
        message: "This is an issue",
        is_issue: true,
        created_by: user,
      },
    ],
  },
};

export const AnonymousNote: Story = {
  args: {
    notes: [
      {
        uuid: "uuid",
        created_on: new Date(),
        message: "This is a note",
        is_issue: false,
        created_by: null,
      },
    ],
  },
};

/** Notes created by another user should not have the option to delete */
export const NotesFromOtherUser = {
  args: {
    currentUser: {
      id: "user",
      username: "user",
      email: "user1@gmail.com",
    },
    notes: [
      {
        uuid: "uuid",
        created_on: new Date(),
        message: "This is a note",
        is_issue: false,
        created_by: {
          id: "other-user",
          username: "other-user",
          email: "bla@gmail.com",
        },
      },
    ],
  },
};
