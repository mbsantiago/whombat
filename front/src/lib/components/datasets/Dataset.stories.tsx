import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { loremIpsum } from "lorem-ipsum";

import Dataset from "./Dataset";

const meta: Meta<typeof Dataset> = {
  title: "Dataset/Item",
  component: Dataset,
};

export default meta;

type Story = StoryObj<typeof Dataset>;

export const Primary: Story = {
  args: {
    dataset: {
      uuid: "123",
      name: "Test Dataset",
      description: "This is a test dataset.",
      audio_dir: "/path/to/audio",
      recording_count: 0,
      created_on: new Date(),
    },
    onClickDataset: fn(),
  },
};

export const WithRecordings: Story = {
  args: {
    dataset: {
      uuid: "123",
      name: "Test Dataset",
      description: "This is a test dataset.",
      audio_dir: "/path/to/audio",
      recording_count: 1201,
      created_on: new Date(),
    },
    onClickDataset: fn(),
  },
};

export const WithLongName: Story = {
  args: {
    dataset: {
      uuid: "123",
      name: "Audio Dataset with a very Long Name describing the Year of Collection and Location as well as mentioning the Institutions involved.",
      description: "This is a test dataset.",
      audio_dir: "/path/to/audio",
      recording_count: 1201,
      created_on: new Date(),
    },
    onClickDataset: fn(),
  },
};

export const WithLongDescription: Story = {
  args: {
    dataset: {
      uuid: "123",
      name: "Dataset",
      description: loremIpsum({
        count: 4,
        units: "paragraphs",
        suffix: "\n\n",
      }),
      audio_dir: "/path/to/audio",
      recording_count: 1201,
      created_on: new Date(),
    },
    onClickDataset: fn(),
  },
};
