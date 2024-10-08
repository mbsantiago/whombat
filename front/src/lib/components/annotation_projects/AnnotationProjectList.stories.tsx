import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { loremIpsum } from "lorem-ipsum";

import AnnotationProjectCreate from "@/lib/components/annotation_projects/AnnotationProjectCreate";
import AnnotationProjectImport from "@/lib/components/annotation_projects/AnnotationProjectImport";
import { AnnotationProjectIcon } from "@/lib/components/icons";
import Search from "@/lib/components/inputs/Search";
import Pagination from "@/lib/components/lists/Pagination";

import type { AnnotationProject } from "@/lib/types";

import AnnotationProjectList from "./AnnotationProjectList";

const meta: Meta<typeof AnnotationProjectList> = {
  title: "AnnotationProject/List",
  component: AnnotationProjectList,
  args: {
    AnnotationProjectSearch: (
      <Search
        label="Search"
        placeholder="Search project..."
        icon={<AnnotationProjectIcon />}
      />
    ),
    AnnotationProjectCreate: (
      <AnnotationProjectCreate onCreateAnnotationProject={fn()} />
    ),
    AnnotationProjectImport: (
      <AnnotationProjectImport onImportAnnotationProject={fn()} />
    ),
    Pagination: <Pagination />,
    onClickAnnotationProject: fn(),
  },
  parameters: {
    controls: {
      exclude: [
        "AnnotationProjectSearch",
        "AnnotationProjectCreate",
        "AnnotationProjectImport",
        "Pagination",
      ],
    },
  },
};

export default meta;

type Story = StoryObj<typeof AnnotationProjectList>;

export const Empty: Story = {
  args: {
    annotationProjects: [],
    isLoading: false,
  },
};

export const WithProjects: Story = {
  args: {
    annotationProjects: [
      {
        uuid: "1",
        name: "Project 1",
        description: "Description of project 1",
        created_on: new Date(),
      },
      {
        uuid: "2",
        name: "Project 2",
        description: "Description of project 2",
        created_on: new Date(),
      },
      {
        uuid: "3",
        name: "Project 3",
        description: "Description of project 3",
        created_on: new Date(),
      },
    ] as AnnotationProject[],
    isLoading: false,
  },
};

export const ManyProjects: Story = {
  args: {
    annotationProjects: [
      {
        uuid: "1",
        name: "Project 1",
        description: loremIpsum({ count: 3, units: "paragraphs" }),
        created_on: new Date(),
      },
      {
        uuid: "2",
        name: "Project 2",
        description: loremIpsum({ count: 3, units: "paragraphs" }),
        created_on: new Date(),
      },
      {
        uuid: "3",
        name: "Project 3",
        description: loremIpsum({ count: 3, units: "paragraphs" }),
        created_on: new Date(),
      },
    ] as AnnotationProject[],
    isLoading: false,
  },
};
