"use client";
import { useSelectedLayoutSegment } from "next/navigation";
import { type ReactNode } from "react";

import Hero from "@/components/Hero";
import { AnnotationProjectIcon, ClipsIcon, TagsIcon } from "@/components/icons";
import Steps from "@/components/Steps";

const steps = [
  {
    title: "Create Set",
    description: "Enter basic details.",
    icon: AnnotationProjectIcon,
  },
  {
    title: "Evaluation Tags",
    description: "Choose tags to focus evaluation on.",
    icon: TagsIcon,
  },
  {
    title: "Task Selection",
    description: "Select annotation tasks to use as ground truth.",
    icon: ClipsIcon,
  },
];

export default function Layout({ children }: { children: ReactNode }) {
  const segment = useSelectedLayoutSegment();

  const step = segment == null ? 0 : segment == "tags" ? 1 : 2;

  return (
    <>
      <Hero text="Create Evaluation Set" />
      <div className="flex flex-row w-100 gap-8 py-8 pl-4 pr-12">
        <div className="w-56 flex-none">
          <div className="sticky top-8">
            <Steps steps={steps} activeStep={step} />
          </div>
        </div>
        <div className="grow">{children}</div>
      </div>
    </>
  );
}
