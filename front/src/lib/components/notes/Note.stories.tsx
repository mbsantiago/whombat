import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { loremIpsum } from "lorem-ipsum";

import Note from "./Note";

const meta: Meta<typeof Note> = {
  title: "Notes/Note",
  component: Note,
};

export default meta;

type Story = StoryObj<typeof Note>;

export const Primary: Story = {
  args: {
    note: {
      uuid: "123",
      message: "This is a test note.",
      is_issue: false,
      created_on: new Date(),
    },
    onResolveNote: fn(),
    onDeleteNote: fn(),
    onClickNote: fn(),
  },
};

export const WithUser: Story = {
  args: {
    note: {
      uuid: "123",
      message: "This is a test note.",
      is_issue: false,
      created_by: {
        id: "123",
        username: "TestUser123",
      },
      created_on: new Date(),
    },
    onResolveNote: fn(),
    onDeleteNote: fn(),
    onClickNote: fn(),
  },
};

export const IsIssue: Story = {
  args: {
    note: {
      uuid: "123",
      message: "This is a test note.",
      is_issue: true,
      created_by: {
        id: "123",
        username: "TestUser123",
      },
      created_on: new Date(),
    },
    onResolveNote: fn(),
    onDeleteNote: fn(),
    onClickNote: fn(),
  },
};

export const CanDelete: Story = {
  args: {
    note: {
      uuid: "123",
      message: "This is a test note.",
      is_issue: false,
      created_by: {
        id: "123",
        username: "TestUser123",
      },
      created_on: new Date(),
    },
    canDelete: true,
    onResolveNote: fn(),
    onDeleteNote: fn(),
    onClickNote: fn(),
  },
};

export const IssueCanDelete: Story = {
  args: {
    note: {
      uuid: "123",
      message: "This is a test note.",
      is_issue: true,
      created_by: {
        id: "123",
        username: "TestUser123",
      },
      created_on: new Date(),
    },
    canDelete: true,
    onResolveNote: fn(),
    onClickNote: fn(),
    onDeleteNote: fn(),
  },
};

export const WithLongMessage: Story = {
  args: {
    note: {
      uuid: "123",
      message: loremIpsum({
        count: 4,
        units: "paragraphs",
        suffix: "\n\n",
      }),
      is_issue: true,
      created_by: {
        id: "123",
        username: "TestUser123",
      },
      created_on: new Date(),
    },
    canDelete: true,
    onResolveNote: fn(),
    onDeleteNote: fn(),
    onClickNote: fn(),
  },
};
