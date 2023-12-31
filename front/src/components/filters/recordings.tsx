import FilterBadge, {
  NumberFilterBadge,
} from "@/components/filters/FilterBadge";
import {
  BooleanFilter,
  FloatFilter,
  NullableFloatFilter,
  TagFilter,
} from "@/components/filters/Filters";
import {
  ChannelsIcon,
  IssueIcon,
  LatitudeIcon,
  LongitudeIcon,
  SampleRateIcon,
  TagIcon,
  TimeExpansionIcon,
  TimeIcon,
} from "@/components/icons";

import type { RecordingFilter } from "@/api/recordings";
import type { FilterDef } from "@/components/filters/FilterMenu";

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
      <TimeIcon className="h-5 w-5 inline-block text-stone-500 mr-1 align-middle" />
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
      <SampleRateIcon className="h-5 w-5 inline-block text-stone-500 mr-1 align-middle" />
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
      <ChannelsIcon className="h-5 w-5 inline-block text-stone-500 mr-1 align-middle" />
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
      <TimeExpansionIcon className="h-5 w-5 inline-block text-stone-500 mr-1 align-middle" />
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
      <LatitudeIcon className="h-5 w-5 inline-block text-stone-500 mr-1 align-middle" />
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
      <LongitudeIcon className="h-5 w-5 inline-block text-stone-500 mr-1 align-middle" />
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
      <TagIcon className="h-5 w-5 inline-block text-stone-500 mr-1 align-middle" />
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
      <IssueIcon className="h-5 w-5 inline-block text-stone-500 mr-1 align-middle" />
    ),
  },
];

export default recordingFilterDefs;
