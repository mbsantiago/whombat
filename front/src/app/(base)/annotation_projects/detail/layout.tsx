"use client";
import { toast } from "react-hot-toast";
import {
  useSearchParams,
  useSelectedLayoutSegment,
  useRouter,
} from "next/navigation";
import { type ReactNode } from "react";
import * as icons from "@/components/icons";
import Loading from "@/app/loading";
import Header from "@/components/Header";
import Tabs from "@/components/Tabs";
import useAnnotationProject from "@/hooks/useAnnotationProject";
import { AnnotationProjectContext } from "./context";
import { H1 } from "@/components/Headings";

function AnnotationProjectHeader({ name }: { name: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const selectedLayoutSegment = useSelectedLayoutSegment();

  return (
    <Header>
      <div className="flex w-full flex-row space-x-4 overflow-x-scroll">
        <H1>{name}</H1>
        <Tabs
          tabs={[
            {
              id: "overview",
              title: "Overview",
              isActive: selectedLayoutSegment === null,
              icon: <icons.DatasetIcon className="h-4 w-4 align-middle" />,
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

export default function Layout({ children }: { children: ReactNode }) {
  const params = useSearchParams();
  const router = useRouter();

  const annotation_project_id = params.get("annotation_project_id");

  // Go to the annotation projects page if the annotation project id is not
  // specified.
  if (annotation_project_id == null) {
    router.push("/annotation_projects/");
    return;
  }

  // Fetch the annotation project.
  const project = useAnnotationProject({
    annotation_project_id: parseInt(annotation_project_id),
    onDelete: () => {
      // Go to previous page.
      toast.success("Annotation project deleted.");
      router.back();
    },
    onUpdate: () => {
      toast.success("Annotation project saved.", {
        id: "annotation-project-update",
      });
    },
  });

  if (project.query.isError) {
    // If not found, go to the annotation projects page.
    toast.error("Annotation project not found.");
    router.push("/annotation_projects/");
    return;
  }

  if (project.query.isLoading) {
    if (project.query.failureCount === 2) {
      toast.error("Error loading annotation project.");
    }
    return <Loading />;
  }

  return (
    <AnnotationProjectContext.Provider value={project}>
      <AnnotationProjectHeader name={project.query.data.name} />
      <div className="p-4">{children}</div>
    </AnnotationProjectContext.Provider>
  );
}
