import FilterBadge, {
  NumberFilterBadge,
} from "@/lib/components/filters/FilterBadge";
import type { FilterDef } from "@/lib/components/filters/FilterMenu";
import {
  BooleanFilter,
  FloatFilter,
  NullableFloatFilter,
  TagFilter,
} from "@/lib/components/filters/Filters";
import {
  ChannelsIcon,
  IssueIcon,
  LatitudeIcon,
  LongitudeIcon,
  SampleRateIcon,
  TagIcon,
  TimeExpansionIcon,
  TimeIcon,
} from "@/lib/components/icons";

import type { RecordingFilter } from "@/lib/types";

// TODO: Create custom filter for integer, date, time, tags and boolean values
const recordingFilterDefs: FilterDef<RecordingFilter>[] = [
  {
    name: "Duration",
    field: "duration",
    selector: ({ setFilter }) => (
      <FloatFilter
        name="duration"
        onChange={(val) => setFilter("duration", val)}
      />
    ),
    render: ({ value, clear }) => (
      <NumberFilterBadge field="Duration" value={value} onRemove={clear} />
    ),
    description: "Select recordings by duration. Duration is in seconds.",
    icon: (
      <TimeIcon className="inline-block mr-1 w-5 h-5 align-middle text-stone-500" />
    ),
  },
  {
    name: "Sample Rate",
    field: "samplerate",
    render: ({ value, clear }) => (
      <NumberFilterBadge field="Sample Rate" value={value} onRemove={clear} />
    ),
    selector: ({ setFilter }) => (
      <FloatFilter onChange={(val) => setFilter("samplerate", val)} />
    ),
    icon: (
      <SampleRateIcon className="inline-block mr-1 w-5 h-5 align-middle text-stone-500" />
    ),
  },
  {
    name: "Channels",
    field: "channels",
    render: ({ value, clear }) => (
      <NumberFilterBadge field="Channels" value={value} onRemove={clear} />
    ),
    selector: ({ setFilter }) => (
      <FloatFilter onChange={(val) => setFilter("channels", val)} />
    ),
    icon: (
      <ChannelsIcon className="inline-block mr-1 w-5 h-5 align-middle text-stone-500" />
    ),
  },
  {
    field: "time_expansion",
    name: "Time Expansion",
    render: ({ value, clear }) => (
      <NumberFilterBadge
        field="Time Expansion"
        value={value}
        onRemove={clear}
      />
    ),
    selector: ({ setFilter }) => (
      <FloatFilter onChange={(val) => setFilter("time_expansion", val)} />
    ),
    icon: (
      <TimeExpansionIcon className="inline-block mr-1 w-5 h-5 align-middle text-stone-500" />
    ),
  },
  {
    field: "latitude",
    name: "Latitude",
    render: ({ value, clear }) => (
      <NumberFilterBadge field="Latitude" value={value} onRemove={clear} />
    ),
    selector: ({ setFilter }) => (
      <NullableFloatFilter
        name="latitude"
        onChange={(val) => setFilter("latitude", val)}
      />
    ),
    icon: (
      <LatitudeIcon className="inline-block mr-1 w-5 h-5 align-middle text-stone-500" />
    ),
  },
  {
    field: "longitude",
    name: "Longitude",
    render: ({ value, clear }) => (
      <NumberFilterBadge field="Longitude" value={value} onRemove={clear} />
    ),
    selector: ({ setFilter }) => (
      <NullableFloatFilter
        name="longitude"
        onChange={(val) => setFilter("longitude", val)}
      />
    ),
    icon: (
      <LongitudeIcon className="inline-block mr-1 w-5 h-5 align-middle text-stone-500" />
    ),
  },
  {
    field: "tag",
    name: "Has Tag",
    render: ({ value, clear }) => (
      <FilterBadge
        field="Tag"
        value={`${value.key}: ${value.value}`}
        onRemove={clear}
      />
    ),
    selector: ({ setFilter }) => (
      <TagFilter onChange={(tag) => setFilter("tag", tag)} />
    ),
    icon: (
      <TagIcon className="inline-block mr-1 w-5 h-5 align-middle text-stone-500" />
    ),
  },
  {
    field: "has_issues",
    name: "Has Issues",
    render: ({ value, clear }) => (
      <FilterBadge
        field="Has Issues"
        value={value ? "Yes" : "No"}
        onRemove={clear}
      />
    ),
    selector: ({ setFilter }) => (
      <BooleanFilter onChange={(val) => setFilter("has_issues", val)} />
    ),
    icon: (
      <IssueIcon className="inline-block mr-1 w-5 h-5 align-middle text-stone-500" />
    ),
  },
];

export default recordingFilterDefs;
