import {
  useRouter,
  useSearchParams,
  useSelectedLayoutSegment,
} from "next/navigation";

import Header from "@/lib/components/ui/Header";
import { H1 } from "@/lib/components/ui/Headings";
import { DatasetIcon, EditIcon, TagsIcon, TasksIcon } from "@/lib/components/icons";
import Tabs from "@/lib/components/navigation/SectionTabs";

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
        <H1 className="overflow-auto max-w-xl whitespace-nowrap">
          {annotationProject.name}
        </H1>
        <Tabs
          tabs={[
            {
              id: "overview",
              title: "Overview",
              isActive: selectedLayoutSegment === null,
              icon: <DatasetIcon className="w-5 h-5 align-middle" />,
              onClick: () => {
                router.push(
                  `/annotation_projects/detail/?${params.toString()}`,
                );
              },
            },
            {
              id: "clips",
              title: "Clips",
              isActive: selectedLayoutSegment === "clips",
              icon: <ClipsIcon className="w-5 h-5 align-middle" />,
              onClick: () => {
                router.push(
                  `/annotation_projects/detail/clips/?${params.toString()}`,
                );
              },
            },
            {
              id: "annotate",
              title: "Annotate",
              isActive: selectedLayoutSegment === "annotation",
              icon: <EditIcon className="w-5 h-5 align-middle" />,
              onClick: () => {
                router.push(
                  `/annotation_projects/detail/annotation/?${params.toString()}`,
                );
              },
            },
            {
              id: "tasks",
              title: "Tasks",
              isActive: selectedLayoutSegment === "tasks",
              icon: <TasksIcon className="w-5 h-5 align-middle" />,
              onClick: () => {
                router.push(
                  `/annotation_projects/detail/tasks/?${params.toString()}`,
                );
              },
            },
            {
              id: "tags",
              title: "Tags",
              isActive: selectedLayoutSegment === "tags",
              icon: <TagsIcon className="w-5 h-5 align-middle" />,
              onClick: () => {
                router.push(
                  `/annotation_projects/detail/tags/?${params.toString()}`,
                );
              },
            },
          ]}
        />
      </div>
    </Header>
  );
}
