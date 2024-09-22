import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Item } from "react-stately";

import Search from "@/lib/components/search/Search";

import AnnotationProjectTasks from "./AnnotationProjectTasks";

const meta: Meta<typeof AnnotationProjectTasks> = {
  title: "AnnotationProject/Tasks",
  component: AnnotationProjectTasks,
  args: {
    onSetFilterField: fn(),
    onToggleSubsample: fn(),
    onSetMaxRecordings: fn(),
    onAddTasks: fn(),
    onToggleClip: fn(),
    onSetClipLength: fn(),
    onSetClipOverlap: fn(),
    onSetClipSubsample: fn(),
    onSetMaxClips: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof AnnotationProjectTasks>;

export const NoDatasetSeletected: Story = {
  args: {},
};

const dataset = {
  uuid: "dataset-1",
  name: "Test Dataset",
  description: "A test dataset",
  audio_dir: "test",
  recording_count: 0,
  created_on: new Date(),
};

const datasetSearch = (
  <Search
    label="search-dataset"
    options={[dataset]}
    value={dataset}
    fields={["name", "description"]}
    displayValue={(dataset) => dataset.name}
    getOptionKey={(dataset) => dataset.uuid}
  >
    {(dataset) => <Item key={dataset.uuid}>{dataset.name}</Item>}
  </Search>
);

export const SelectedDataset: Story = {
  args: {
    dataset,
    numSelectedRecordings: 100,
    numSelectedClips: 300,
    DatasetSearch: datasetSearch,
  },
};

export const WithRecordingSubsample: Story = {
  args: {
    dataset,
    maxRecordings: 20,
    subsampleRecordings: true,
    numSelectedRecordings: 20,
    numSelectedClips: 60,
    DatasetSearch: datasetSearch,
  },
};

export const WithClipSubsample: Story = {
  args: {
    dataset,
    maxRecordings: 20,
    subsampleClip: true,
    numSelectedRecordings: 100,
    numSelectedClips: 60,
    DatasetSearch: datasetSearch,
  },
};
