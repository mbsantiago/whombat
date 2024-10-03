"use client";

import Pagination from "@/app/components/Pagination";
import ClipAnnotationSpectrogram from "@/app/components/clip_annotations/ClipAnnotationSpectrogram";

import useClipAnnotations from "@/app/hooks/api/useClipAnnotations";

import ExplorationLayout from "@/lib/components/layouts/Exploration";
import StackedListLayout from "@/lib/components/layouts/StackedList";
import ListCounts from "@/lib/components/lists/ListCounts";

export default function Page() {
  const { items, total, pagination, isLoading } = useClipAnnotations({
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
      <StackedListLayout items={items}>
        {(clipAnnotation) => (
          <ClipAnnotationSpectrogram
            clipAnnotation={clipAnnotation}
            withHotKeys={false}
            withSoundEvents={false}
            withViewportBar={false}
            withAnnotationControls={false}
            enabled={false}
            height={200}
          />
        )}
      </StackedListLayout>
    </ExplorationLayout>
  );
}
