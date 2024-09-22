import {
  useRouter,
  useSearchParams,
  useSelectedLayoutSegment,
} from "next/navigation";

import {
  ModelIcon,
  SettingsIcon,
  TagsIcon,
  TasksIcon,
  UserIcon,
} from "@/lib/components/icons";
import SectionTabs from "@/lib/components/navigation/SectionTabs";
import Tab from "@/lib/components/ui/Tab";

import type { EvaluationSet } from "@/lib/types";

export default function EvaluationSetTabs({
  evaluationSet,
}: {
  evaluationSet: EvaluationSet;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const selectedLayoutSegment = useSelectedLayoutSegment();

  return (
    <SectionTabs
      title={evaluationSet.name}
      tabs={[
        <Tab
          key={"overview"}
          active={selectedLayoutSegment === null}
          onClick={() =>
            router.push(`/evaluation/detail/?${params.toString()}`)
          }
        >
          <SettingsIcon className="w-5 h-5 align-middle" />
          Overview
        </Tab>,
        <Tab
          key={"tasks"}
          active={selectedLayoutSegment === "tasks"}
          onClick={() =>
            router.push(`/evaluation/detail/tasks/?${params.toString()}`)
          }
        >
          <TasksIcon className="w-5 h-5 align-middle" />
          Examples
        </Tab>,
        <Tab
          key={"model-runs"}
          active={selectedLayoutSegment === "model_runs"}
          onClick={() =>
            router.push(`/evaluation/detail/model_runs/?${params.toString()}`)
          }
        >
          <ModelIcon className="w-5 h-5 align-middle" />
          Model Runs
        </Tab>,
        <Tab
          key={"user-sessions"}
          active={selectedLayoutSegment === "user_runs"}
          onClick={() =>
            router.push(`/evaluation/detail/user_runs/?${params.toString()}`)
          }
        >
          <UserIcon className="w-5 h-5 align-middle" />
          User Sessions
        </Tab>,
        <Tab
          key={"tags"}
          active={selectedLayoutSegment === "tags"}
          onClick={() =>
            router.push(`/evaluation/detail/tags/?${params.toString()}`)
          }
        >
          <TagsIcon className="w-5 h-5 align-middle" />
          Tags
        </Tab>,
      ]}
    />
  );
}
