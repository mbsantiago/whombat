import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import AnnotationProjectTagsSummary from "./AnnotationProjectTagsSummary";

const meta: Meta<typeof AnnotationProjectTagsSummary> = {
  title: "AnnotationProject/TagsSummary",
  component: AnnotationProjectTagsSummary,
  args: {
    onAddTags: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof AnnotationProjectTagsSummary>;

export const NoTags: Story = {
  args: {
    annotationProject: {
      uuid: "1",
      name: "Project 1",
      description: "Annotation project 1",
      created_on: new Date(),
    },
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
    annotationProject: {
      uuid: "1",
      name: "Project 1",
      description: "Annotation project 1",
      created_on: new Date(),
    },
  },
};

export const WithProjectTags: Story = {
  args: {
    annotationProject: {
      uuid: "1",
      name: "Project 1",
      description: "Annotation project 1",
      created_on: new Date(),
      tags: [
        { key: "species", value: "Myotis lucifugus" },
        { key: "species", value: "Myotis septentrionalis" },
        { key: "event", value: "Echolocation" },
      ],
    },
  },
};

export const WithAnnotations: Story = {
  args: {
    annotationProject: {
      uuid: "1",
      name: "Project 1",
      description: "Annotation project 1",
      created_on: new Date(),
      tags: [
        { key: "species", value: "Myotis lucifugus" },
        { key: "species", value: "Myotis septentrionalis" },
        { key: "event", value: "Echolocation" },
      ],
    },
    clipTags: [
      {
        clip_annotation_uuid: "1",
        tag: { key: "species", value: "Myotis lucifugus" },
      },
      {
        clip_annotation_uuid: "1",
        tag: { key: "event", value: "Echolocation" },
      },
      {
        clip_annotation_uuid: "2",
        tag: { key: "species", value: "Myotis septentrionalis" },
      },
      {
        clip_annotation_uuid: "2",
        tag: { key: "event", value: "Echolocation" },
      },
      {
        clip_annotation_uuid: "3",
        tag: { key: "event", value: "Myotis lucifugus" },
      },
    ],
    soundEventTags: [
      {
        sound_event_annotation_uuid: "1",
        tag: { key: "species", value: "Myotis septentrionalis" },
      },
      {
        sound_event_annotation_uuid: "1",
        tag: { key: "event", value: "Echolocation" },
      },
      {
        sound_event_annotation_uuid: "2",
        tag: { key: "species", value: "Myotis septentrionalis" },
      },
      {
        sound_event_annotation_uuid: "2",
        tag: { key: "event", value: "Echolocation" },
      },
      {
        sound_event_annotation_uuid: "3",
        tag: { key: "species", value: "Myotis septentrionalis" },
      },
    ],
  },
};
