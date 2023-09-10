import {
  useSearchParams,
  useSelectedLayoutSegment,
  useRouter,
} from "next/navigation";
import { DatasetIcon } from "@/components/icons";
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
              icon: <DatasetIcon className="h-4 w-4 align-middle" />,
              onClick: () => {
                router.push(
                  `/annotation_projects/detail/?${params.toString()}`,
                );
              },
            },
          ]}
        />
      </div>
    </Header>
  );
}
