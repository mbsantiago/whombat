import { useMemo } from "react";

import api from "@/app/api";
import Card from "@/components/Card";
import Empty from "@/components/Empty";
import Loading from "@/components/Loading";
import Pagination from "@/components/lists/Pagination";
import useSoundEventAnnotation from "@/hooks/api/useSoundEventAnnotation";
import SoundEventAnnotationSpectrogram from "@/components/sound_event_annotations/SoundEventAnnotationSpectrogram";
import usePagedQuery from "@/hooks/utils/usePagedQuery";
import type { SoundEventAnnotationFilter } from "@/lib/api/sound_event_annotations";
import type { SpectrogramParameters, SoundEventAnnotation } from "@/types";

const empty = {};

export default function SoundEventAnnotationsGallery(props: {
  filter?: SoundEventAnnotationFilter;
  parameters?: SpectrogramParameters;
  onParametersSave?: (parameters: SpectrogramParameters) => void;
}) {
  const { items, query, pagination, total } = usePagedQuery<
    SoundEventAnnotation,
    SoundEventAnnotationFilter
  >({
    name: "sound_event_annotations_scatter",
    queryFn: api.soundEventAnnotations.getMany,
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
            of <span className="text-emerald-500 font-bold">{total}</span> sound
            events
          </span>
        </div>
        <Pagination {...pagination} />
      </div>
      <div className="grid grid-cols-4 gap-8">
        {annotations.map((annotation) => (
          <Card key={annotation.uuid}>
            <Spectrogram
              annotation={annotation}
              parameters={props.parameters}
              onParametersSave={props.onParametersSave}
            />
          </Card>
        ))}
      </div>
      <div className="flex flex-row justify-center">
        <Pagination {...pagination} />
      </div>
    </div>
  );
}

function Spectrogram(props: {
  annotation: SoundEventAnnotation;
  parameters?: SpectrogramParameters;
  onParametersSave?: (parameters: SpectrogramParameters) => void;
  height?: number;
}) {
  const { annotation, parameters, onParametersSave, height = 260 } = props;
  const {
    recording: { data: recording, isLoading },
  } = useSoundEventAnnotation({
    uuid: annotation.uuid,
    soundEventAnnotation: annotation,
    withRecording: true,
  });

  if (isLoading) {
    return (
      <div
        className="w-full flex flex-row items-center justify-center"
        style={{ height }}
      >
        <Loading />
      </div>
    );
  }

  if (recording == null) {
    return <Empty>No recording found </Empty>;
  }

  return (
    <SoundEventAnnotationSpectrogram
      recording={recording}
      soundEventAnnotation={annotation}
      parameters={parameters}
      onParametersSave={onParametersSave}
      height={height}
      withBar={false}
      withPlayer={false}
      withControls={false}
      withSettings={false}
    />
  );
}
