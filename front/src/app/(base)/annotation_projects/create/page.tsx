"use client";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import toast from "react-hot-toast";

import AnnotationProjectCreate from "@/components/annotation_projects/AnnotationProjectCreate";
import Hero from "@/components/Hero";
import Center from "@/components/layouts/Center";

import type { AnnotationProject } from "@/types";

export default function Page() {
  const router = useRouter();

  const onCreate = useCallback(
    (project: AnnotationProject) => {
      toast.success("Annotation Project created!", {
        id: `annotation_project_created-${project.uuid}`,
      });
      router.push(
        `/annotation_projects/detail/?annotation_project_uuid=${project.uuid}`,
      );
    },
    [router],
  );

  const onError = useCallback(() => {
    toast.error("Something went wrong. Please try again.");
  }, []);

  return (
    <>
      <Hero text="Create Annotation Project" />
      <Center>
        <AnnotationProjectCreate onCreate={onCreate} onError={onError} />
      </Center>
    </>
  );
}
