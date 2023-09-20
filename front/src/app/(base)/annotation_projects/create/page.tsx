"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import api from "@/app/api";
import Button from "@/components/Button";
import { BackIcon, CloseIcon, NextIcon } from "@/components/icons";
import Hero from "@/components/Hero";
import Steps from "@/components/Steps";
import { AnnotationProjectIcon, ClipsIcon, TagsIcon } from "@/components/icons";
import { type AnnotationProject } from "@/api/annotation_projects";

import ProjectClips from "../components/ProjectClips";
import ProjectCreate from "../components/ProjectCreate";
import ProjectTags from "../components/ProjectTags";

const steps = [
  {
    title: "Create Project",
    description: "Enter basic details.",
    icon: AnnotationProjectIcon,
  },
  {
    title: "Annotation Tags",
    description: "Choose tags for annotation.",
    icon: TagsIcon,
  },
  {
    title: "Clip Selection",
    description: "Select clips to include.",
    icon: ClipsIcon,
  },
];

function NavBar({
  project,
  onCancel,
  onBack,
  onDone,
}: {
  project: AnnotationProject;
  onCancel: () => void;
  onBack: () => void;
  onDone: () => void;
}) {
  return (
    <div className="col-span-2 flex flex-row justify-between items-center mb-3">
      <h3 className="text-lg font-bold mb-3">Project Name: {project.name}</h3>
      <div className="inline-flex gap-3">
        <Button variant="danger" mode="text" onClick={onCancel}>
          <CloseIcon className="inline-block w-4 h-4 mr-1" /> Cancel
        </Button>
        <Button variant="warning" mode="text" onClick={onBack}>
          <BackIcon className="inline-block w-4 h-4 mr-1" /> Back
        </Button>
        <Button onClick={onDone}>
          Done
          <NextIcon className="inline-block w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

export default function CreateAnotationProject() {
  const [step, setStep] = useState(0);

  const router = useRouter();

  const [annotationProject, setAnnotationProject] =
    useState<AnnotationProject | null>(null);

  const delete_ = useMutation({
    mutationFn: api.annotation_projects.delete,
  });

  return (
    <>
      <Hero text="Create Annotation Project" />
      <div className="flex flex-row w-100 gap-8 py-8 pl-4 pr-12">
        <div className="w-56 flex-none">
          <div className="sticky top-8">
            <Steps steps={steps} activeStep={step} />
          </div>
        </div>
        <div className="grow">
          {step === 0 ? (
            <ProjectCreate
              onCreate={(project) => {
                setAnnotationProject(project);
                setStep(1);
              }}
            />
          ) : step === 1 ? (
            <>
              <NavBar
                project={annotationProject as AnnotationProject}
                onCancel={() => {
                  delete_.mutate(annotationProject?.id as number);
                  router.push("/annotation_projects");
                }}
                onBack={() => {
                  delete_.mutate(annotationProject?.id as number);
                  setStep(0);
                }}
                onDone={() => setStep(2)}
              />
              <ProjectTags project={annotationProject as AnnotationProject} />
            </>
          ) : (
            <>
              <NavBar
                project={annotationProject as AnnotationProject}
                onCancel={() => {
                  delete_.mutate(annotationProject?.id as number);
                  router.push("/annotation_projects");
                }}
                onBack={() => setStep(1)}
                onDone={() => {
                  router.push(
                    `/annotation_projects/detail/?annotation_project_id=${annotationProject?.id}`,
                  );
                }}
              />
              <ProjectClips project={annotationProject as AnnotationProject} />
            </>
          )}
        </div>
      </div>
    </>
  );
}
