import {
  TimeIcon,
  LatitudeIcon,
  LongitudeIcon,
  DateIcon,
  TagIcon,
  IssueIcon,
  SampleRateIcon,
  ChannelsIcon,
  TimeExpansionIcon,
} from "@/components/icons";
import { FloatFilter, NullableFloatFilter } from "@/components/Filters";
import { type FilterDef } from "@/components/FilterMenu";


// TODO: Create custom filter for integer, date, time, tags and boolean values
const recordingFilterDefs: FilterDef[] = [
  {
    name: "Duration",
    selector: ({ setFilter }) => (
      <FloatFilter prefix="duration" name="duration" setFilter={setFilter} />
    ),
    description: "Select recordings by duration. Duration is in seconds.",
    icon: (
      <TimeIcon className="h-5 w-5 inline-block text-stone-500 mr-1 align-middle" />
    ),
  },

  {
    name: "Sample Rate",
    selector: ({ setFilter }) => <FloatFilter setFilter={setFilter} />,
    icon: (
      <SampleRateIcon className="h-5 w-5 inline-block text-stone-500 mr-1 align-middle" />
    ),
  },

  {
    name: "Channels",
    selector: ({ setFilter }) => <FloatFilter setFilter={setFilter} />,
    icon: (
      <ChannelsIcon className="h-5 w-5 inline-block text-stone-500 mr-1 align-middle" />
    ),
  },

  {
    name: "Time Expansion",
    selector: ({ setFilter }) => <FloatFilter setFilter={setFilter} />,
    icon: (
      <TimeExpansionIcon className="h-5 w-5 inline-block text-stone-500 mr-1 align-middle" />
    ),
  },

  {
    name: "Date",
    selector: ({ setFilter }) => <FloatFilter setFilter={setFilter} />,
    icon: (
      <DateIcon className="h-5 w-5 inline-block text-stone-500 mr-1 align-middle" />
    ),
  },

  {
    name: "Time",
    selector: ({ setFilter }) => <FloatFilter setFilter={setFilter} />,
    icon: (
      <TimeIcon className="h-5 w-5 inline-block text-stone-500 mr-1 align-middle" />
    ),
  },

  {
    name: "Latitude",
    selector: ({ setFilter }) => (
      <NullableFloatFilter
        name="latitude"
        prefix="latitude"
        setFilter={setFilter}
      />
    ),
    icon: (
      <LatitudeIcon className="h-5 w-5 inline-block text-stone-500 mr-1 align-middle" />
    ),
  },

  {
    name: "Longitude",
    selector: ({ setFilter }) => (
      <NullableFloatFilter
        name="longitude"
        prefix="longitude"
        setFilter={setFilter}
      />
    ),
    icon: (
      <LongitudeIcon className="h-5 w-5 inline-block text-stone-500 mr-1 align-middle" />
    ),
  },

  {
    name: "Has Tag",
    selector: ({ setFilter }) => <FloatFilter setFilter={setFilter} />,
    icon: (
      <TagIcon className="h-5 w-5 inline-block text-stone-500 mr-1 align-middle" />
    ),
  },

  {
    name: "Has Issues",
    selector: ({ setFilter }) => <FloatFilter setFilter={setFilter} />,
    icon: (
      <IssueIcon className="h-5 w-5 inline-block text-stone-500 mr-1 align-middle" />
    ),
  },
];

export default recordingFilterDefs;
