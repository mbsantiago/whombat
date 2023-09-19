import {
  useSearchParams,
  useSelectedLayoutSegment,
  useRouter,
} from "next/navigation";
import { DatasetIcon, TasksIcon, TagsIcon, EditIcon } from "@/components/icons";
import Header from "@/components/Header";
import Tabs from "@/components/Tabs";
import { H1 } from "@/components/Headings";

export default function AnnotationProjectHeader({ name }: { name: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const selectedLayoutSegment = useSelectedLayoutSegment();

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
              icon: <DatasetIcon className="h-5 w-5 align-middle" />,
              onClick: () => {
                router.push(
                  `/annotation_projects/detail/?${params.toString()}`,
                );
              },
            },
            {
              id: "tasks",
              title: "Tasks",
              isActive: selectedLayoutSegment === "tasks",
              icon: <TasksIcon className="h-5 w-5 align-middle" />,
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
              icon: <TagsIcon className="h-5 w-5 align-middle" />,
              onClick: () => {
                router.push(
                  `/annotation_projects/detail/tags/?${params.toString()}`,
                );
              },
            },
            {
              id: "annotate",
              title: "Annotate",
              isActive: selectedLayoutSegment === "annotation",
              icon: <EditIcon className="h-5 w-5 align-middle" />,
              onClick: () => {
                router.push(
                  `/annotation_projects/detail/annotation/?${params.toString()}`,
                );
              },
            },
          ]}
        />
      </div>
    </Header>
  );
}
