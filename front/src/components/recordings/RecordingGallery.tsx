import { useMemo } from "react";

import api from "@/app/api";
import Loading from "@/components/Loading";
import Pagination from "@/components/lists/Pagination";
import RecordingSpectrogram from "@/components/recordings/RecordingSpectrogram";
import usePagedQuery from "@/hooks/utils/usePagedQuery";
import type { RecordingFilter } from "@/lib/api/recordings";
import type { SpectrogramParameters, Recording } from "@/types";

const empty = {};

export default function RecordingsGallery(props: {
  filter?: RecordingFilter;
  parameters?: SpectrogramParameters;
  onParametersSave?: (parameters: SpectrogramParameters) => void;
}) {
  const { items, query, pagination, total } = usePagedQuery<
    Recording,
    RecordingFilter
  >({
    name: "recordings",
    queryFn: api.recordings.getMany,
    pageSize: 12,
    filter: props.filter || empty,
  });

  const annotations = useMemo(() => items || [], [items]);

  if (query.isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col gap-2 px-4">
      <div className="flex flex-row justify-between items-center">
        <div>
          <span className="text-stone-500">
            Showing{" "}
            <span className="font-bold">
              {pagination.page * pagination.pageSize} -{" "}
              {pagination.page * pagination.pageSize + annotations.length}
            </span>{" "}
            of <span className="text-emerald-500 font-bold">{total}</span>{" "}
            recordings
          </span>
        </div>
        <Pagination {...pagination} />
      </div>
      <div className="flex flex-col gap-8">
        {annotations.map((annotation) => (
          <Spectrogram
            key={annotation.uuid}
            annotation={annotation}
            parameters={props.parameters}
            onParametersSave={props.onParametersSave}
          />
        ))}
      </div>
      <div className="flex flex-row justify-center">
        <Pagination {...pagination} />
      </div>
    </div>
  );
}

function Spectrogram(props: {
  annotation: Recording;
  parameters?: SpectrogramParameters;
  onParametersSave?: (parameters: SpectrogramParameters) => void;
  height?: number;
}) {
  const { annotation, parameters, onParametersSave, height = 260 } = props;

  return (
    <RecordingSpectrogram
      recording={annotation}
      parameters={parameters}
      onParameterSave={onParametersSave}
      height={height}
      withBar={false}
      withPlayer={false}
      withControls={false}
      withSettings={false}
    />
  );
}
