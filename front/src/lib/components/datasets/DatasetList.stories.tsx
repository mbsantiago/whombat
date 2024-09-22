import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { loremIpsum } from "lorem-ipsum";

import { DatasetIcon } from "@/lib/components/icons";
import Search from "@/lib/components/inputs/Search";
import Pagination from "@/lib/components/lists/Pagination";

import DatasetList from "./DatasetList";

const meta: Meta<typeof DatasetList> = {
  title: "Dataset/List",
  component: DatasetList,
  args: {
    onClickDataset: fn(),
    Pagination: <Pagination />,
    DatasetSearch: (
      <Search
        label="Search"
        placeholder="Search dataset..."
        icon={<DatasetIcon />}
      />
    ),
  },
};

export default meta;

type Story = StoryObj<typeof DatasetList>;

export const Empty: Story = {
  args: {
    datasets: [],
  },
};

export const WithDatasets: Story = {
  args: {
    datasets: [
      {
        uuid: "123",
        name: "Test Dataset",
        description: "This is a test dataset.",
        audio_dir: "/path/to/audio",
        recording_count: 1201,
        created_on: new Date(),
      },
      {
        uuid: "456",
        name: "Another Dataset",
        description: "This is another test dataset.",
        audio_dir: "/path/to/another/audio",
        recording_count: 0,
        created_on: new Date(),
      },
      {
        uuid: "789",
        name: "Dataset with a very Long Name describing the Year of Collection and Location as well as mentioning the Institutions involved.",
        description: "This is a test dataset.",
        audio_dir: "/path/to/audio",
        recording_count: 1201,
        created_on: new Date(),
      },
      {
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
    ],
  },
};
