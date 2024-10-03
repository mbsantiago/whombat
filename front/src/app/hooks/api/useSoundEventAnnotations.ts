import api from "@/app/api";

import useFilter from "@/lib/hooks/utils/useFilter";
import usePagedQuery from "@/lib/hooks/utils/usePagedQuery";

import type { SoundEventAnnotationFilter } from "@/lib/types";

const _empty: SoundEventAnnotationFilter = {};
const _fixed: (keyof SoundEventAnnotationFilter)[] = [];

export default function useSoundEventAnnotations({
  filter: initialFilter = _empty,
  fixed = _fixed,
  pageSize = 100,
}: {
  filter?: SoundEventAnnotationFilter;
  fixed?: (keyof SoundEventAnnotationFilter)[];
  pageSize?: number;
} = {}) {
  const filter = useFilter<SoundEventAnnotationFilter>({
    defaults: initialFilter,
    fixed,
  });

  const { items, total, pagination, query } = usePagedQuery({
    name: "sound_event_annotations",
    queryFn: api.soundEventAnnotations.getMany,
    pageSize: pageSize,
    filter: filter.filter,
  });

  return {
    ...query,
    items,
    total,
    pagination,
    filter,
  } as const;
}
