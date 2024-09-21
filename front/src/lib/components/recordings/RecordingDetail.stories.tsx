import RecordingDetail from "@/lib/components/recordings/RecordingDetail";
import {
  type Note,
  type Recording,
  type SpectrogramWindow,
  type Tag,
} from "@/lib/types";
import type { Meta, StoryObj } from "@storybook/react";

import RecordingActions from "./RecordingActions";
import RecordingHeader from "./RecordingHeader";
import RecordingMap from "./RecordingMap";
import RecordingMediaInfo from "./RecordingMediaInfo";
import RecordingNotes from "./RecordingNotes";
import RecordingSpectrogram from "./RecordingSpectrogram";
import RecordingTagBar from "./RecordingTagBar";

const meta: Meta<typeof RecordingDetail> = {
  title: "Recordings/Detail",
  component: RecordingDetail,
};

export default meta;

type Story = StoryObj<typeof RecordingDetail>;

const recording: Recording = {
  uuid: "uuid",
  path: "path/to/recording.wav",
  hash: "hash",
  duration: 10,
  samplerate: 44100,
  channels: 1,
  time_expansion: 1,
  latitude: 51.5074,
  longitude: 0.1278,
  date: new Date(),
  time: "12:00:00",
  created_on: new Date(),
  tags: [
    { key: "species", value: "Myotis myotis" },
    { key: "environment", value: "closed" },
  ],
  notes: [
    {
      uuid: "uuid",
      message: "This is a note",
      is_issue: false,
      created_on: new Date(),
    },
    {
      uuid: "uuid",
      message: "Hey fix this!",
      is_issue: true,
      created_on: new Date(),
    },
  ],
};

const viewport: SpectrogramWindow = {
  time: { min: 0, max: 3 },
  freq: { min: 0, max: 22050 },
};

const bounds: SpectrogramWindow = {
  time: { min: 0, max: 10 },
  freq: { min: 0, max: 22050 },
};

export const Primary: Story = {
  args: {
    RecordingHeader: <RecordingHeader recording={recording} />,
    RecordingTagBar: <RecordingTagBar tags={recording.tags as Tag[]} />,
    RecordingSpectrogram: (
      <RecordingSpectrogram
        samplerate={recording.samplerate}
        bounds={bounds}
        viewport={viewport}
      />
    ),
    RecordingNotes: <RecordingNotes notes={recording.notes as Note[]} />,
    RecordingActions: <RecordingActions />,
    RecordingMediaInfo: <RecordingMediaInfo recording={recording} />,
    RecordingMap: <RecordingMap recording={recording} />,
  },
};
