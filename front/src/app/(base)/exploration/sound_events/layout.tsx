"use client";

import { type ReactNode } from "react";

import SoundEventExplorationTabs from "@/app/(base)/exploration/components/SoundEventExplorationTabs";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="flex flex-row justify-center">
        <p className="max-w-prose text-sm text-center text-stone-500">
          Explore all annotated sound events. Use the filtering options to
          select a subset, and choose the view you wish to use to explore the
          sound events.
        </p>
      </div>
      <div className="flex flex-row gap-2 justify-center mt-4 w-full">
        <SoundEventExplorationTabs />
      </div>
      <div className="p-2">{children}</div>
    </>
  );
}
