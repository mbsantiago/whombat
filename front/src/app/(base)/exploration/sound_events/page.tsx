"use client";
import { useState } from "react";

import AnnotationGallery from "@/components/annotations/AnnotationsGallery";
import AnnotationsScatterPlot from "@/components/annotations/AnnotationsScatterPlot";
import { GalleryIcon, ListIcon, PlotIcon } from "@/components/icons";
import Tabs from "@/components/Tabs";

import useSoundEventAnnotations from "@/hooks/api/useAnnotations";

export default function Page() {
  const [view, setView] = useState("list");

  const annotations = useSoundEventAnnotations({
    pageSize: 1000,
  });

  return (
    <div className="flex flex-col gap-4 p-2">
      <div className="flex flex-row gap-2 justify-center w-full">
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
