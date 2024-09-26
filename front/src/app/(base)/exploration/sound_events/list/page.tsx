"use client";

import Pagination from "@/app/components/Pagination";
import SoundEventAnnotationSpectrogram from "@/app/components/sound_event_annotations/SoundEventAnnotationSpectrogram";

import useSoundEventAnnotations from "@/app/hooks/api/useSoundEventAnnotations";

import ExplorationLayout from "@/lib/components/layouts/Exploration";
import StackedList from "@/lib/components/layouts/StackedList";
import ListCounts from "@/lib/components/lists/ListCounts";

export default function Page() {
  const { items, total, pagination, isLoading } = useSoundEventAnnotations({
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
    >
      <StackedList items={items}>
        {(soundEventAnnotation) => (
          <SoundEventAnnotationSpectrogram
            height={200}
            withViewportBar={false}
            withHotKeys={false}
            soundEventAnnotation={soundEventAnnotation}
          />
        )}
      </StackedList>
    </ExplorationLayout>
  );
}
