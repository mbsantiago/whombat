import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import RecordingTable from "@/lib/components/recordings/RecordingTable";
import type { Recording, Note } from "@/lib/types";

const meta: Meta<typeof RecordingTable> = {
  title: "Recordings/Table",
  component: RecordingTable,
};

export default meta;

type Story = StoryObj<typeof RecordingTable>;

export const Primary: Story = {
  args: {
    onSearchChange: fn(),
    onFilterFieldSet: fn(),
    onClearFilterField: fn(),
    onCellKeyDown: fn(),
    onClickRecording: fn(),
    onDeleteRecordingTag: fn(),
    onAddRecordingTag: fn(),
    onUpdateRecording: fn(),
    onCreateTag: fn(),
    onChangeTagQuery: fn(),
    recordings: [
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
    ] as Recording[],
    page: 0,
    availableTags: [],
    numPages: 1,
    pageSize: 10,
  },
};
