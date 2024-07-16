import { useMemo } from "react";

import api from "@/app/api";
import Loading from "@/lib/components/ui/Loading";
import Pagination from "@/lib/components/lists/Pagination";
import ClipAnnotationSpectrogram from "@/lib/components/clip_annotations/ClipAnnotationSpectrogram";
import usePagedQuery from "@/lib/hooks/utils/usePagedQuery";
import type { ClipAnnotationFilter } from "@/lib/api/clip_annotations";
import type { SpectrogramParameters, ClipAnnotation } from "@/lib/types";

const empty = {};

export default function ClipAnnotationsGallery(props: {
  filter?: ClipAnnotationFilter;
  parameters?: SpectrogramParameters;
  onParametersSave?: (parameters: SpectrogramParameters) => void;
}) {
  const { items, query, pagination, total } = usePagedQuery<
    ClipAnnotation,
    ClipAnnotationFilter
  >({
    name: "clip_annotations",
    queryFn: api.clipAnnotations.getMany,
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
            of <span className="text-emerald-500 font-bold">{total}</span> clips
          </span>
        </div>
        <Pagination {...pagination} />
      </div>
      <div className="grid grid-cols-4 gap-8">
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
  annotation: ClipAnnotation;
  parameters?: SpectrogramParameters;
  onParametersSave?: (parameters: SpectrogramParameters) => void;
  height?: number;
}) {
  const { annotation, parameters, onParametersSave, height = 260 } = props;
  return (
    <ClipAnnotationSpectrogram
      clipAnnotation={annotation}
      parameters={parameters}
      onParameterSave={onParametersSave}
      height={height}
      withBar={false}
      withPlayer={false}
      withControls={false}
      withSettings={false}
      withAudioShortcuts={false}
      disabled={true}
    />
  );
}
