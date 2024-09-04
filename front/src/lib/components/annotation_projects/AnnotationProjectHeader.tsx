import {
  useRouter,
  useSearchParams,
  useSelectedLayoutSegment,
} from "next/navigation";

import Header from "@/lib/components/ui/Header";
import {
  DatasetIcon,
  EditIcon,
  TagsIcon,
  TasksIcon,
  ClipsIcon,
} from "@/lib/components/icons";
import SectionTabs from "@/lib/components/navigation/SectionTabs";
import Tab from "@/lib/components/ui/Tab";

import type { AnnotationProject } from "@/lib/types";

export default function AnnotationProjectHeader({
  annotationProject,
}: {
  annotationProject: AnnotationProject;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const selectedLayoutSegment = useSelectedLayoutSegment();

  return (
    <Header>
      <div className="flex overflow-x-auto flex-row space-x-4 w-full">
        <SectionTabs
          title={annotationProject.name}
          tabs={[
            <Tab
              key="overview"
              active={selectedLayoutSegment === null}
              onClick={() => {
                router.push(
                  `/annotation_projects/detail/?${params.toString()}`,
                );
              }}
            >
              <DatasetIcon className="w-5 h-5 align-middle" />
              Overview
            </Tab>,
            <Tab
              key="clips"
              active={selectedLayoutSegment === "clips"}
              onClick={() => {
                router.push(
                  `/annotation_projects/detail/clips/?${params.toString()}`,
                );
              }}
            >
              <ClipsIcon className="w-5 h-5 align-middle" />
              Clips
            </Tab>,
            <Tab
              key="annotate"
              active={selectedLayoutSegment === "annotation"}
              onClick={() => {
                router.push(
                  `/annotation_projects/detail/annotation/?${params.toString()}`,
                );
              }}
            >
              <EditIcon className="w-5 h-5 align-middle" />
              Annotate
            </Tab>,
            <Tab
              key="tasks"
              active={selectedLayoutSegment === "tasks"}
              onClick={() => {
                router.push(
                  `/annotation_projects/detail/tasks/?${params.toString()}`,
                );
              }}
            >
              <TasksIcon className="w-5 h-5 align-middle" />
              Tasks
            </Tab>,
            <Tab
              key="tags"
              active={selectedLayoutSegment === "tags"}
              onClick={() => {
                router.push(
                  `/annotation_projects/detail/tags/?${params.toString()}`,
                );
              }}
            >
              <TagsIcon className="w-5 h-5 align-middle" />
              Tags
            </Tab>,
          ]}
        />
      </div>
    </Header>
  );
}
