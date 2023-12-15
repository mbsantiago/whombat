import api from "@/app/api";
import usePagedQuery from "@/hooks/api/usePagedQuery";
import useFilter from "@/hooks/api/useFilter";
import { type SoundEventAnnotationFilter } from "@/api/sound_event_annotations";

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
    func: api.soundEventAnnotations.getMany,
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
