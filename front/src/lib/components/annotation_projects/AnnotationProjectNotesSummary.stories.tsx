import type { Meta, StoryObj } from "@storybook/react";

import Note from "@/lib/components/notes/Note";

import AnnotationProjectNotesSummary from "./AnnotationProjectNotesSummary";

const meta: Meta<typeof AnnotationProjectNotesSummary> = {
  title: "AnnotationProject/NotesSummary",
  component: AnnotationProjectNotesSummary,
  args: {
    SoundEventAnnotationNote: ({ soundEventAnnotationNote }) => (
      <Note note={soundEventAnnotationNote.note} />
    ),
    ClipAnnotationNote: ({ clipAnnotationNote }) => (
      <Note note={clipAnnotationNote.note} />
    ),
  },
  parameters: {
    controls: { exclude: ["ClipAnnotationNote", "SoundEventAnnotationNote"] },
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
        clip_annotation_uuid: "clip-1",
        created_on: new Date(),
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
        clip_annotation_uuid: "clip-1",
        created_on: new Date(),
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
        sound_event_annotation_uuid: "se-1",
        created_on: new Date(),
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
        sound_event_annotation_uuid: "se-1",
        created_on: new Date(),
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
        clip_annotation_uuid: "clip-1",
        created_on: new Date(),
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
        sound_event_annotation_uuid: "se-1",
        created_on: new Date(),
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
