"use client";

import { type ReactNode } from "react";

import ExplorationTabs from "@/app/(base)/exploration/components/ExplorationTabs";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <ExplorationTabs />
      <div className="p-2">{children}</div>
    </>
  );
}
