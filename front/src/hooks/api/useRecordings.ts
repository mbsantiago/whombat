import { useMutation } from "@tanstack/react-query";

import { type RecordingFilter, type RecordingUpdate } from "@/api/recordings";
import usePagedQuery from "@/hooks/api/usePagedQuery";
import useFilter from "@/hooks/api/useFilter";
import api from "@/app/api";

const emptyFilter = {};

export default function useRecordings({
  filter: initialFilter = emptyFilter,
  pageSize = 20,
}: {
  filter?: RecordingFilter;
  pageSize?: number;
} = {}) {
  const filter = useFilter<RecordingFilter>({ fixed: initialFilter });

  const { items, total, pagination, query } = usePagedQuery({
    name: "dataset-recordings",
    func: api.recordings.getMany,
    pageSize: pageSize,
    filter: filter.filter,
  });

  const update = useMutation({
    mutationFn: ({
      recording_id,
      data,
    }: {
      recording_id: number;
      data: RecordingUpdate;
    }) => {
      return api.recordings.update(recording_id, data);
    },
    onSuccess: () => {
      query.refetch();
    },
  });

  const addTag = useMutation({
    mutationFn: ({
      recording_id,
      tag_id,
    }: {
      recording_id: number;
      tag_id: number;
    }) => {
      return api.recordings.addTag({ recording_id, tag_id });
    },
    onSuccess: () => {
      query.refetch();
    },
  });

  const removeTag = useMutation({
    mutationFn: ({
      recording_id,
      tag_id,
    }: {
      recording_id: number;
      tag_id: number;
    }) => {
      return api.recordings.removeTag({ recording_id, tag_id });
    },
    onSuccess: () => {
      query.refetch();
    },
  });

  return {
    items,
    total,
    pagination,
    query,
    filter,
    update,
    addTag,
    removeTag,
  }
}
