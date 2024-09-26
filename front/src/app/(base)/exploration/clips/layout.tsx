"use client";

import { type ReactNode } from "react";

import ClipExplorationTabs from "@/app/(base)/exploration/components/ClipExplorationTabs";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="flex flex-row justify-center">
        <p className="max-w-prose text-sm text-center text-stone-500">
          Explore all annotated clips. Use the filtering options to select a
          subset, and choose the view you wish to use to explore the clips.
        </p>
      </div>
      <div className="flex flex-row gap-2 justify-center mt-4 w-full">
        <ClipExplorationTabs />
      </div>
      <div className="p-2">{children}</div>
    </>
  );
}
