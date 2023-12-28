import { useSearchParams, useSelectedLayoutSegment } from "next/navigation";

import { type EvaluationSet } from "@/api/evaluation_sets";
import Header from "@/components/Header";
import { H1 } from "@/components/Headings";
import {
  ModelIcon,
  SettingsIcon,
  TasksIcon,
  UserIcon,
} from "@/components/icons";
import Tabs from "@/components/Tabs";

export default function EvaluationSetHeader({
  evaluationSet,
}: {
  evaluationSet: EvaluationSet;
}) {
  const params = useSearchParams();
  const selectedLayoutSegment = useSelectedLayoutSegment();

  const { name } = evaluationSet;

  return (
    <Header>
      <div className="flex w-full flex-row space-x-4 overflow-x-scroll">
        <H1 className="max-w-xl whitespace-nowrap overflow-scroll">{name}</H1>
        <Tabs
          tabs={[
            {
              id: "overview",
              title: "Overview",
              isActive: selectedLayoutSegment === null,
              icon: <TasksIcon className="h-5 w-5 align-middle" />,
              href: `/evaluation/detail/?${params.toString()}`,
            },
            {
              id: "model-runs",
              title: "Model Runs",
              isActive: selectedLayoutSegment === "model_runs",
              icon: <ModelIcon className="h-5 w-5 align-middle" />,
              href: `/evaluation/detail/runs/?${params.toString()}`,
            },
            {
              id: "user-sessions",
              title: "User Sessions",
              isActive: selectedLayoutSegment === "user_sessions",
              icon: <UserIcon className="h-5 w-5 align-middle" />,
              href: `/evaluation/detail/train/?${params.toString()}`,
            },
            {
              id: "settings",
              title: "Settings",
              isActive: selectedLayoutSegment === "settings",
              icon: <SettingsIcon className="h-5 w-5 align-middle" />,
              href: `/evaluation/detail/settings/?${params.toString()}`,
            },
          ]}
        />
      </div>
    </Header>
  );
}
