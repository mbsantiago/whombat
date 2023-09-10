import Card from "@/components/Card";
import { type Recording } from "@/api/recordings";
import {
  ChannelsIcon,
  TimeIcon,
  SampleRateIcon,
  TimeExpansionIcon,
} from "@/components/icons";


function Label({ label }: { label: string }) {
  return (
    <div className="font-thin text-sm text-stone-500 mr-2">
      {label}
    </div>
  );
}

function Units({ units }: { units: string }) {
  return <span className="ml-1 text-stone-500">{units}</span>;
}


export default function RecordingMediaInfo({
  recording,
}: {
  recording: Recording;
}) {
  return (
    <Card>
      <div className="inline-flex items-center">
        <TimeIcon className="h-5 w-5 inline-block text-stone-500 mr-1" />
        <Label label="Duration" />
        {recording.duration.toFixed(3)}
        <Units units="s" />
      </div>
      <div className="inline-flex items-center">
        <ChannelsIcon className="h-5 w-5 inline-block text-stone-500 mr-1" />
        <Label label="Channels" />
        {recording.channels}
      </div>
      <div className="inline-flex items-center">
        <SampleRateIcon className="h-5 w-5 inline-block text-stone-500 mr-1" />
        <Label label="Sample rate" />
        {recording.samplerate.toLocaleString()}
        <Units units="Hz" />
      </div>
      <div className="inline-flex items-center">
        <TimeExpansionIcon className="h-5 w-5 inline-block text-stone-500 mr-1" />
        <Label label="Time expansion" />
        {recording.time_expansion}
      </div>
    </Card>
  );
}
