import RecordingTable from "@/lib/components/recordings/RecordingTable";
import type { Note, Recording } from "@/lib/types";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import TagSearchBar, { type TagSearchBarProps } from "../tags/TagSearchBar";

const meta: Meta<typeof RecordingTable> = {
  title: "Recordings/Table",
  component: RecordingTable,
  parameters: {
    controls: {
      exclude: [
        "TagSearchBar",
        "tagColorFn",
        "onBlur",
        "onKeyDown",
        "placement",
        "autoPlacement",
        "onCellKeyDown",
      ],
    },
  },
};

export default meta;

type Story = StoryObj<typeof RecordingTable>;

const tags = [
  { key: "species", value: "Tadarida brasiliensis" },
  { key: "species", value: "Myotis myotis" },
  { key: "event", value: "Echolocation" },
  { key: "tag1", value: "value1" },
];

const recordings: Recording[] = [
  {
    uuid: "1",
    path: "/path/to/audio/file.wav",
    hash: "hash",
    duration: 10,
    channels: 1,
    samplerate: 44100,
    time_expansion: 1,
    latitude: 51.5072,
    longitude: -0.1276,
    date: new Date(),
    time: "19:00:00",
    tags: [],
    created_on: new Date(),
  },
  {
    uuid: "2",
    path: "/audio/file/with_an_unreasonably/long_path/that_contains/many/subdirectories/and/ends/with/a/file.wav",
    hash: "hash",
    duration: 10,
    channels: 1,
    samplerate: 44100,
    time_expansion: 1,
    latitude: 51.5072,
    longitude: -0.1276,
    date: new Date(),
    time: "19:00:00",
    tags: [],
    created_on: new Date(),
  },
  {
    uuid: "3",
    path: "/audio/with/minimal/metadata.flac",
    hash: "hash",
    duration: 10,
    channels: 1,
    samplerate: 44100,
    time_expansion: 1,
    tags: [],
    created_on: new Date(),
  },
  {
    uuid: "4",
    path: "/audio/with/tags.wav",
    hash: "hash",
    duration: 10,
    channels: 1,
    samplerate: 44100,
    time_expansion: 1,
    tags: [
      { key: "tag", value: "value" },
      { key: "species", value: "Myotis myotis" },
    ],
    created_on: new Date(),
  },
  {
    uuid: "4",
    path: "/audio/with/notes.wav",
    hash: "hash",
    duration: 10,
    channels: 1,
    samplerate: 44100,
    time_expansion: 1,
    tags: [],
    notes: [
      {
        uuid: "note-1",
        message: "This is a note",
        created_on: new Date(),
      },
      {
        uuid: "note-2",
        message: "This is another note",
        created_on: new Date(),
      },
    ] as Note[],
    created_on: new Date(),
  },
];

const props = {
  onSearchChange: fn(),
  onSetFilterField: fn(),
  onClearFilterField: fn(),
  onClickRecording: fn(),
  onClickTag: fn(),
  onDeleteRecordingTag: fn(),
  onAddRecordingTag: fn(),
  onUpdateRecording: fn(),
  onCreateTag: fn(),
  setPageSize: fn(),
  nextPage: fn(),
  prevPage: fn(),
  setPage: fn(),
  TagSearchBar: (props: TagSearchBarProps) => (
    <TagSearchBar tags={tags} {...props} />
  ),
};

export const Primary: Story = {
  args: {
    recordings,
    page: 0,
    numPages: 2,
    hasNextPage: true,
    pageSize: 10,
    ...props,
  },
};

export const WithFilters: Story = {
  args: {
    recordings,
    page: 0,
    numPages: 2,
    hasNextPage: true,
    pageSize: 10,
    filter: { duration: { gt: 2 } },
    ...props,
  },
};
