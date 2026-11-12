"use client";

import Pagination from "@/app/components/Pagination";
import SoundEventAnnotationSpectrogram from "@/app/components/sound_event_annotations/SoundEventAnnotationSpectrogram";
import useSoundEventAnnotations from "@/app/hooks/api/useSoundEventAnnotations";
import FilterBar from "@/lib/components/filters/FilterBar";
import FilterMenu from "@/lib/components/filters/FilterMenu";
import soundEventAnnotationFilterDefs from "@/lib/components/filters/sound_event_annotations";
import ExplorationLayout from "@/lib/components/layouts/Exploration";
import Gallery from "@/lib/components/layouts/Gallery";
import ListCounts from "@/lib/components/lists/ListCounts";

export default function Page() {
  const { items, total, pagination, isLoading, filter } =
    useSoundEventAnnotations({
      pageSize: 10,
    });

  return (
    <ExplorationLayout
      isLoading={isLoading}
      Pagination={<Pagination pagination={pagination} />}
      Counts={
        <ListCounts
          total={total}
          startIndex={pagination.page * pagination.pageSize}
          endIndex={(pagination.page + 1) * pagination.pageSize}
        />
      }
      Filtering={
        <div className="flex flex-row justify-between gap-2">
          <FilterMenu
            onSetFilterField={filter.set}
            filterDef={soundEventAnnotationFilterDefs}
          />
          <FilterBar
            filter={filter.filter}
            total={total}
            showIfEmpty={true}
            filterDef={soundEventAnnotationFilterDefs}
          />
        </div>
      }
    >
      <Gallery items={items}>
        {(soundEventAnnotation) => (
          <SoundEventAnnotationSpectrogram
            height={200}
            withViewportBar={false}
            withHotKeys={false}
            soundEventAnnotation={soundEventAnnotation}
          />
        )}
      </Gallery>
    </ExplorationLayout>
  );
}
