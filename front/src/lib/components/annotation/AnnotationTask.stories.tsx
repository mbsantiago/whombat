import type { Meta, StoryObj } from "@storybook/react";

import AnnotationTaskComponent from "./AnnotationTask";
import AnnotationProgress from "./AnnotationProgress";
import AnnotationContext from "./AnnotationContext";
import AnnotationTagPalette from "./AnnotationTagPalette";

import AnnotationTaskStatus from "../annotation_tasks/AnnotationTaskStatus";

import ClipAnnotationSpectrogram from "../clip_annotations/ClipAnnotationSpectrogram";
import ClipAnnotationNotes from "../clip_annotations/ClipAnnotationNotes";
import ClipAnnotationTags from "../clip_annotations/ClipAnnotationTags";
import ClipAnnotationSoundEvents from "../clip_annotations/ClipAnnotationSoundEvents";

import Player from "../audio/Player";
import ViewportToolbar from "../spectrograms/ViewportToolbar";
import AnnotationControls from "../annotation/AnnotationControls";
import SettingsMenu from "../settings/SettingsMenu";
import ViewportBar from "../spectrograms/ViewportBar";
import Canvas from "../spectrograms/Canvas";

import {
  DEFAULT_AUDIO_SETTINGS,
  DEFAULT_SPECTROGRAM_SETTINGS,
} from "@/lib/constants";
import type {
  SpectrogramWindow,
  SoundEventAnnotation,
  AnnotationTask,
  Recording,
  Tag,
} from "@/lib/types";

const samplerate = 44100;

const viewport: SpectrogramWindow = {
  time: { min: 0, max: 1 },
  freq: { min: 0, max: samplerate / 2 },
};

const bounds: SpectrogramWindow = {
  time: { min: 0, max: 10 },
  freq: { min: 0, max: samplerate / 2 },
};

const baseRecording: Recording = {
  uuid: "1",
  path: "path/to/recording.wav",
  hash: "hash",
  duration: 1,
  channels: 1,
  samplerate: 44100,
  time_expansion: 1,
  created_on: new Date(),
};

const tags: Tag[] = [
  { key: "animal", value: "bird" },
  { key: "animal", value: "dog" },
  { key: "animal", value: "cat" },
  { key: "animal", value: "bird" },
];

const task: AnnotationTask = {
  uuid: "task-1",
  created_on: new Date(),
};

const meta: Meta<typeof AnnotationTaskComponent> = {
  title: "Annotation/Task",
  component: AnnotationTaskComponent,
  args: {
    AnnotationProgress: (
      <AnnotationProgress instructions={"Annotate"} tasks={[]} />
    ),
    AnnotationTagPalette: <AnnotationTagPalette tags={tags} />,
    AnnotationTaskStatus: <AnnotationTaskStatus task={task} />,
    AnnotationContext: <AnnotationContext recording={baseRecording} />,
    AnnotationTaskSpectrogram: (
      <ClipAnnotationSpectrogram
        ViewportToolbar={<ViewportToolbar mode="panning" />}
        AnnotationControls={
          <AnnotationControls mode="none" geometryType="BoundingBox" />
        }
        Player={
          <Player
            currentTime={0}
            endTime={10}
            speedOptions={[{ value: 1, label: "1x" }]}
          />
        }
        SettingsMenu={
          <SettingsMenu
            audioSettings={DEFAULT_AUDIO_SETTINGS}
            spectrogramSettings={DEFAULT_SPECTROGRAM_SETTINGS}
            samplerate={samplerate}
          />
        }
        ViewportBar={<ViewportBar viewport={viewport} bounds={bounds} />}
        Canvas={<Canvas viewport={viewport} height={400} />}
      />
    ),
    AnnotationTaskTags: <ClipAnnotationTags tags={[]} />,
    AnnotationTaskNotes: <ClipAnnotationNotes notes={[]} />,
    AnnotationTaskSoundEvents: <ClipAnnotationSoundEvents />,
  },
  parameters: {
    controls: {
      exclude: [
        "AnnotationProgress",
        "AnnotationTagPalette",
        "AnnotationTaskStatus",
        "AnnotationContext",
        "AnnotationTaskSpectrogram",
        "AnnotationTaskTags",
        "AnnotationTaskNotes",
        "AnnotationTaskSoundEvents",
      ],
    },
  },
};

export default meta;

type Story = StoryObj<typeof AnnotationTaskComponent>;

export const Primary: Story = {
  args: {
    selectedTask: null,
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    selectedTask: null,
    isLoading: true,
  },
};

export const SelectedTask: Story = {
  args: {
    selectedTask: task,
    isLoading: false,
  },
};

const soundEventAnnotation: SoundEventAnnotation = {
  uuid: "se-annotation-1",
  created_on: new Date(),
  sound_event: {
    created_on: new Date(),
    uuid: "se-1",
    geometry_type: "BoundingBox",
    geometry: {
      type: "BoundingBox",
      coordinates: [0, 0, 1, 1],
    },
  },
};

export const SelectedTaskAndSoundEvent: Story = {
  args: {
    selectedTask: task,
    isLoading: false,
    AnnotationTaskSoundEvents: (
      <ClipAnnotationSoundEvents
        selectedSoundEventAnnotation={soundEventAnnotation}
      />
    ),
  },
};
