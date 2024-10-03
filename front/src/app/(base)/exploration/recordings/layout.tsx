"use client";

import { type ReactNode } from "react";

import RecordingExplorationTabs from "@/app/(base)/exploration/components/RecordingExplorationTabs";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="flex flex-row justify-center">
        <p className="max-w-prose text-sm text-center text-stone-500">
          Explore all recordings. Use the filtering options to select a subset,
          and choose the view you wish to use to explore the recordings.
        </p>
      </div>
      <div className="flex flex-row gap-2 justify-center mt-4 w-full">
        <RecordingExplorationTabs />
      </div>
      <div className="p-2">{children}</div>
    </>
  );
}
