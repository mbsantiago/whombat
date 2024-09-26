"use client";

import Pagination from "@/app/components/Pagination";
import RecordingSpectrogram from "@/app/components/recordings/RecordingSpectrogram";

import useRecordings from "@/app/hooks/api/useRecordings";

import RecordingGallery from "@/lib/components/exploration/RecordingGallery";
import FilterBar from "@/lib/components/filters/FilterBar";
import FilterMenu from "@/lib/components/filters/FilterMenu";
import recordingFilterDefs from "@/lib/components/filters/recordings";
import ExplorationLayout from "@/lib/components/layouts/Exploration";
import ListCounts from "@/lib/components/lists/ListCounts";

export default function Page() {
  const {
    items: recordings,
    total,
    filter,
    pagination,
    isLoading,
  } = useRecordings({
    pageSize: 10,
  });

  return (
    <ExplorationLayout
      isLoading={isLoading}
      Filtering={
        <div className="flex flex-row">
          <FilterMenu
            filterDef={recordingFilterDefs}
            button="Apply filters"
            mode="text"
            onSetFilterField={filter.set}
          />
          <FilterBar
            filterDef={recordingFilterDefs}
            filter={filter.filter}
            onClearFilterField={filter.clear}
            fixedFilterFields={filter.fixed}
          />
        </div>
      }
      Pagination={<Pagination pagination={pagination} />}
      Counts={
        <ListCounts
          total={total}
          startIndex={pagination.page * pagination.pageSize}
          endIndex={(pagination.page + 1) * pagination.pageSize}
        />
      }
    >
      <RecordingGallery
        recordings={recordings}
        RecordingSpectrogram={RecordingSpectrogram}
        withViewportBar={false}
        height={200}
        withHotKeys={false}
      />
    </ExplorationLayout>
  );
}
