"use client";

import ExplorationTabs from "@/app/(base)/exploration/components/ExplorationTabs";
import { type ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <ExplorationTabs />
      <div className="p-2">{children}</div>
    </>
  );
}
