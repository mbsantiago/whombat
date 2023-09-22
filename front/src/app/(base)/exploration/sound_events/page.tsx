"use client";
import dynamic from "next/dynamic";
import { useState } from "react";

import useAnnotations from "@/hooks/api/useAnnotations";
import Tabs from "@/components/Tabs";
import { ListIcon, GalleryIcon, PlotIcon } from "@/components/icons";
import AnnotationGallery from "@/components/annotations/AnnotationsGallery";

const AnnotationsScatterPlot = dynamic(
  () => import("@/components/annotations/AnnotationsScatterPlot"),
  { ssr: false },
);

export default function Page() {
  const [view, setView] = useState("list");

  const annotations = useAnnotations({
    pageSize: 1000,
  });

  return (
    <div className="flex flex-col gap-4 p-2">
      <div className="flex flex-row w-full justify-center gap-2">
        <Tabs
          tabs={[
            {
              id: "list",
              title: "List",
              isActive: view === "list",
              icon: <ListIcon className="w-5 h-5" />,
              onClick: () => setView("list"),
            },
            {
              id: "gallery",
              title: "Gallery",
              isActive: view === "gallery",
              icon: <GalleryIcon className="w-5 h-5" />,
              onClick: () => setView("gallery"),
            },
            {
              id: "plot",
              title: "Scatterplot",
              isActive: view === "plot",
              icon: <PlotIcon className="w-5 h-5" />,
              onClick: () => setView("plot"),
            },
          ]}
        />
      </div>
      {view === "list" ? (
        <div>list</div>
      ) : view === "gallery" ? (
        <AnnotationGallery annotations={annotations.items} />
      ) : (
        <AnnotationsScatterPlot annotations={annotations.items} />
      )}
    </div>
  );
}
