import { useSearchParams, useSelectedLayoutSegment } from "next/navigation";

import Header from "@/components/Header";
import { H1 } from "@/components/Headings";
import {
  ModelIcon,
  SettingsIcon,
  TagsIcon,
  TasksIcon,
  UserIcon,
} from "@/components/icons";
import Tabs from "@/components/Tabs";

import type { EvaluationSet } from "@/types";

export default function EvaluationSetHeader({
  evaluationSet,
}: {
  evaluationSet: EvaluationSet;
}) {
  const params = useSearchParams();
  const selectedLayoutSegment = useSelectedLayoutSegment();

  return (
    <Header>
      <div className="flex w-full flex-row space-x-4 overflow-x-scroll">
        <H1 className="max-w-xl whitespace-nowrap overflow-scroll">
          {evaluationSet.name}
        </H1>
        <Tabs
          tabs={[
            {
              id: "overview",
              title: "Overview",
              isActive: selectedLayoutSegment === null,
              icon: <SettingsIcon className="h-5 w-5 align-middle" />,
              href: `/evaluation/detail/?${params.toString()}`,
            },
            {
              id: "tasks",
              title: "Examples",
              isActive: selectedLayoutSegment === "tasks",
              icon: <TasksIcon className="h-5 w-5 align-middle" />,
              href: `/evaluation/detail/tasks/?${params.toString()}`,
            },
            {
              id: "model-runs",
              title: "Model Runs",
              isActive: selectedLayoutSegment === "model_runs",
              icon: <ModelIcon className="h-5 w-5 align-middle" />,
              href: `/evaluation/detail/model_runs/?${params.toString()}`,
            },
            {
              id: "user-sessions",
              title: "User Sessions",
              isActive: selectedLayoutSegment === "user_runs",
              icon: <UserIcon className="h-5 w-5 align-middle" />,
              href: `/evaluation/detail/user_runs/?${params.toString()}`,
            },
            {
              id: "tags",
              title: "Tags",
              isActive: selectedLayoutSegment === "tags",
              icon: <TagsIcon className="h-5 w-5 align-middle" />,
              href: `/evaluation/detail/tags/?${params.toString()}`,
            },
          ]}
        />
      </div>
    </Header>
  );
}
