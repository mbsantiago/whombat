import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import AnnotationProjectNotesSummary from "./AnnotationProjectNotesSummary";

const meta: Meta<typeof AnnotationProjectNotesSummary> = {
  title: "AnnotationProject/NotesSummary",
  component: AnnotationProjectNotesSummary,
  args: {
    onClickNote: fn(),
    onResolveNote: fn(),
    onDeleteNote: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof AnnotationProjectNotesSummary>;

export const Empty: Story = {
  args: {
    isLoading: false,
    clipNotes: [],
    soundEventNotes: [],
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
    clipNotes: [],
    soundEventNotes: [],
  },
};

export const WithClipNotes: Story = {
  args: {
    isLoading: false,
    clipNotes: [
      {
        task_uuid: "task-1",
        clip_uuid: "clip-1",
        note: {
          uuid: "note1",
          message: "This is a note",
          is_issue: false,
          created_on: new Date(),
        },
      },
    ],
    soundEventNotes: [],
  },
};

export const WithClipIssues: Story = {
  args: {
    isLoading: false,
    clipNotes: [
      {
        task_uuid: "task-1",
        clip_uuid: "clip-1",
        note: {
          uuid: "note1",
          message: "This clip has an issue",
          is_issue: true,
          created_on: new Date(),
        },
      },
    ],
    soundEventNotes: [],
  },
};

export const WithSoundEventNotes: Story = {
  args: {
    isLoading: false,
    clipNotes: [],
    soundEventNotes: [
      {
        task_uuid: "task-1",
        sound_event_uuid: "se-1",
        note: {
          uuid: "note1",
          message: "This is a note",
          is_issue: false,
          created_on: new Date(),
        },
      },
    ],
  },
};

export const WithSoundEventIssues: Story = {
  args: {
    isLoading: false,
    clipNotes: [],
    soundEventNotes: [
      {
        task_uuid: "task-1",
        sound_event_uuid: "se-1",
        note: {
          uuid: "note1",
          message: "This sound event has an issue",
          is_issue: true,
          created_on: new Date(),
        },
      },
    ],
  },
};

export const WithIssuesBoth: Story = {
  args: {
    isLoading: false,
    clipNotes: [
      {
        task_uuid: "task-1",
        clip_uuid: "clip-1",
        note: {
          uuid: "note1",
          message: "This clip has an issue",
          is_issue: true,
          created_on: new Date(),
        },
      },
    ],
    soundEventNotes: [
      {
        task_uuid: "task-1",
        sound_event_uuid: "se-1",
        note: {
          uuid: "note2",
          message: "This sound event has an issue",
          is_issue: true,
          created_on: new Date(),
        },
      },
    ],
  },
};
