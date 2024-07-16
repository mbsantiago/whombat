import Card from "@/lib/components/ui/Card";
import {
  ChannelsIcon,
  SampleRateIcon,
  TimeExpansionIcon,
  TimeIcon,
} from "@/lib/components/icons";

function Label({ label }: { label: string }) {
  return <div className="mr-2 text-sm font-thin text-stone-500">{label}</div>;
}

function Units({ units }: { units: string }) {
  return <span className="ml-1 text-stone-500">{units}</span>;
}

export default function RecordingMediaInfo({
  duration,
  channels,
  samplerate,
  time_expansion = 1,
}: {
  duration: number;
  channels: number;
  samplerate: number;
  time_expansion?: number;
}) {
  return (
    <Card>
      <div className="inline-flex items-center">
        <TimeIcon className="inline-block mr-1 w-5 h-5 text-stone-500" />
        <Label label="Duration" />
        {duration.toFixed(3)}
        <Units units="s" />
      </div>
      <div className="inline-flex items-center">
        <ChannelsIcon className="inline-block mr-1 w-5 h-5 text-stone-500" />
        <Label label="Channels" />
        {channels}
      </div>
      <div className="inline-flex items-center">
        <SampleRateIcon className="inline-block mr-1 w-5 h-5 text-stone-500" />
        <Label label="Sample rate" />
        {samplerate.toLocaleString()}
        <Units units="Hz" />
      </div>
      <div className="inline-flex items-center">
        <TimeExpansionIcon className="inline-block mr-1 w-5 h-5 text-stone-500" />
        <Label label="Time expansion" />
        {time_expansion}
      </div>
    </Card>
  );
}
