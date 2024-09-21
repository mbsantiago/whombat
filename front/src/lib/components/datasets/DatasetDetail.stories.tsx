import { type Dataset } from "@/lib/types";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import DatasetDetail from "./DatasetDetail";
import DatasetNotesSummary from "./DatasetNotesSummary";
import DatasetOverview from "./DatasetOverview";
import DatasetTagsSummary from "./DatasetTagsSummary";
import DatasetUpdate from "./DatasetUpdate";

const meta: Meta<typeof DatasetDetail> = {
  title: "Dataset/Detail",
  component: DatasetDetail,
  parameters: {
    controls: {
      exclude: [
        "DatasetUpdate",
        "DatasetOverview",
        "DatasetTagsSummary",
        "DatasetNotesSummary",
      ],
    },
  },
};

export default meta;

type Story = StoryObj<typeof DatasetDetail>;

const dataset: Dataset = {
  uuid: "123",
  name: "Test Dataset",
  description: "This is a test dataset.",
  audio_dir: "/path/to/audio",
  recording_count: 0,
  created_on: new Date(),
};

export const Primary: Story = {
  args: {
    DatasetUpdate: <DatasetUpdate dataset={dataset} />,
    DatasetOverview: (
      <DatasetOverview dataset={dataset} onClickDatasetRecordings={fn()} />
    ),
    DatasetTagsSummary: <DatasetTagsSummary tags={[]} onTagClick={fn()} />,
    DatasetNotesSummary: <DatasetNotesSummary notes={[]} onClickNote={fn()} />,
  },
};
