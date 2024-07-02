import toast from "react-hot-toast";

import { H3 } from "@/lib/components/Headings";
import { RecordingIcon } from "@/lib/components/icons";
import Tooltip from "@/lib/components/Tooltip";
import useRecording from "@/lib/hooks/api/useRecording";

import RecordingDate from "./RecordingDate";
import RecordingLocation from "./RecordingLocation";
import RecordingTime from "./RecordingTime";

import type { Recording } from "@/lib/types";

/** Get the basename of a path
 * Taken from https://stackoverflow.com/a/25221100
 */
export function getBaseName(path: string) {
  return path.split("\\").pop()?.split("/").pop();
}

export function removeExtension(path: string) {
  return path.split(".").slice(0, -1).join(".");
}

export default function RecordingHeader({
  recording,
}: {
  recording: Recording;
}) {
  const { path } = recording;
  const baseName = removeExtension(getBaseName(path) ?? "");
  const { data, update: updateRecording } = useRecording({
    uuid: recording.uuid,
    recording,
    enabled: true,
  });

  return (
    <div className="flex overflow-x-auto flex-row gap-x-6 items-center w-full">
      <div className="inline-flex items-center">
        <RecordingIcon className="inline-block mr-1 w-5 h-5 text-stone-500" />
        <H3 className="max-w-xl whitespace-nowrap">
          <Tooltip
            tooltip={
              <div className="w-96 text-sm font-thin tracking-tighter whitespace-normal break-all dark:bg-stone-700 dark:border-stone-800">
                <span className="font-normal text-blue-500">Full path:</span>{" "}
                {path}
              </div>
            }
            placement="bottom"
          >
            <button
              type="button"
              className="overflow-hidden w-full text-ellipsis"
              onClick={() => {
                navigator.clipboard.writeText(path);
                toast.success("Copied full path to clipboard");
              }}
            >
              {baseName}
              <span className="text-sm text-stone-500">.WAV</span>
            </button>
          </Tooltip>
        </H3>
      </div>
      <RecordingLocation
        latitude={data?.latitude}
        longitude={data?.longitude}
        onChange={updateRecording.mutate}
      />
      <RecordingTime time={data?.time} onChange={updateRecording.mutate} />
      <RecordingDate date={data?.date} onChange={updateRecording.mutate} />
    </div>
  );
}
