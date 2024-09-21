import EvaluationSetCreate from "@/lib/components/evaluation_sets/EvaluationSetCreate";
import EvaluationSetImport from "@/lib/components/evaluation_sets/EvaluationSetImport";
import { EvaluationIcon } from "@/lib/components/icons";
import Search from "@/lib/components/inputs/Search";
import Pagination from "@/lib/components/lists/Pagination";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { loremIpsum } from "lorem-ipsum";

import EvaluationSetList from "./EvaluationSetList";

const meta: Meta<typeof EvaluationSetList> = {
  title: "EvaluationSet/List",
  component: EvaluationSetList,
  args: {
    onClickEvaluationSet: fn(),
    onClickEvaluationSetTag: fn(),
    Pagination: <Pagination />,
    Search: (
      <Search
        label="Search"
        placeholder="Search dataset..."
        icon={<EvaluationIcon />}
      />
    ),
    Create: <EvaluationSetCreate onCreateEvaluationSet={fn()} />,
    Import: <EvaluationSetImport onImportEvaluationSet={fn()} />,
  },
  parameters: {
    controls: { exclude: ["Pagination", "Search", "Create", "Import"] },
  },
};

export default meta;

type Story = StoryObj<typeof EvaluationSetList>;

export const Empty: Story = {
  args: {
    evaluationSets: [],
  },
};

export const Loading: Story = {
  args: {
    evaluationSets: [],
    isLoading: true,
  },
};

export const WithEvaluationSets: Story = {
  args: {
    evaluationSets: [
      {
        uuid: "1",
        name: "Evaluation Set 1",
        description: "This is a description",
        created_on: new Date(),
        task: "Sound Event Detection",
        tags: [{ key: "species", value: "Myotis myotis" }],
      },
      {
        uuid: "2",
        name: "Evaluation Set 2",
        description: loremIpsum({ count: 5, units: "paragraphs" }),
        created_on: new Date(),
        task: "Clip Classification",
        tags: [{ key: "species", value: "Myotis myotis" }],
      },
    ],
  },
};
