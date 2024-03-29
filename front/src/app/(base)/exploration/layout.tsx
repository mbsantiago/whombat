"use client";
import { type ReactNode } from "react";

import ExplorationHeader from "@/components/exploration/Header";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <ExplorationHeader />
      <div className="p-2">{children}</div>
    </>
  );
}
