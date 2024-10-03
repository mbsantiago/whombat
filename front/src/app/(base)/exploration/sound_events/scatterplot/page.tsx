"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import Pagination from "@/app/components/Pagination";
import SoundEventAnnotationSpectrogram from "@/app/components/sound_event_annotations/SoundEventAnnotationSpectrogram";

import useSoundEventAnnotation from "@/app/hooks/api/useSoundEventAnnotation";

import api from "@/app/api";
import Error from "@/app/error";

import ExplorationLayout from "@/lib/components/layouts/Exploration";
import ListCounts from "@/lib/components/lists/ListCounts";
import Empty from "@/lib/components/ui/Empty";
import Loading from "@/lib/components/ui/Loading";

import useFilter from "@/lib/hooks/utils/useFilter";
import usePagedQuery from "@/lib/hooks/utils/usePagedQuery";

import type { ScatterPlotData, SoundEventAnnotationFilter } from "@/lib/types";

const SoundEventAnnotationsScatterPlot = dynamic(
  () =>
    import(
      "@/lib/components/sound_event_annotations/SoundEventAnnotationsScatterPlot"
    ),
  { ssr: false },
);

export default function Page() {
  const [selectedSoundEvent, setSelectedSoundEvent] =
    useState<ScatterPlotData | null>(null);

  const filter = useFilter<SoundEventAnnotationFilter>();

  const {
    items,
    pagination,
    total,
    query: { isLoading },
  } = usePagedQuery({
    name: "sound_event_annotations_scatter_plot",
    queryFn: api.soundEventAnnotations.getScatterPlotData,
    pageSize: 1000,
    filter,
  });

  return (
    <ExplorationLayout
      isLoading={isLoading}
      Pagination={<Pagination pagination={pagination} />}
      Counts={
        <ListCounts
          total={total}
          startIndex={pagination.page * pagination.pageSize}
          endIndex={Math.min(
            (pagination.page + 1) * pagination.pageSize,
            total,
          )}
        />
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <SoundEventAnnotationsScatterPlot
          data={items}
          onClickSoundEvent={setSelectedSoundEvent}
          height={600}
        />
        <div className="col-start-2 h-full grow">
          {selectedSoundEvent == null ? (
            <Empty outerClassName="h-full" className="h-full grow">
              Select a sound event by clicking on the plot.
            </Empty>
          ) : (
            <SoundEventItem soundEvent={selectedSoundEvent} height={400} />
          )}
        </div>
      </div>
    </ExplorationLayout>
  );
}

function SoundEventItem({
  soundEvent,
  height,
}: {
  soundEvent: ScatterPlotData;
  height: number;
}) {
  const { data, isLoading, error } = useSoundEventAnnotation({
    uuid: soundEvent.uuid,
  });

  if (isLoading) return <Loading />;

  if (data == null) return <Error error={error || undefined} />;

  return (
    <SoundEventAnnotationSpectrogram
      soundEventAnnotation={data}
      height={height}
    />
  );
}
