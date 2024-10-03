import { LoopIcon, NextIcon, PreviousIcon } from "@/lib/components/icons";
import * as ui from "@/lib/components/ui";

export default function NavigationControls(props: {
  index: number | null;
  total: number;
  hasNext?: boolean;
  hasPrev?: boolean;
  onRandom?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}) {
  return (
    <div className="inline-flex gap-2 items-center">
      <ui.Button
        mode="text"
        variant={props.hasPrev ? "primary" : "secondary"}
        onClick={props.onPrev}
        disabled={!props.hasPrev}
      >
        <PreviousIcon className="w-6 h-6" />
      </ui.Button>
      <ui.Button
        mode="text"
        variant={props.hasNext || props.hasPrev ? "primary" : "secondary"}
        onClick={props.onRandom}
        disabled={!props.hasPrev && !props.hasNext}
      >
        <LoopIcon className="w-6 h-6" />
      </ui.Button>
      <ui.Button
        mode="text"
        variant={props.hasNext ? "primary" : "secondary"}
        onClick={props.onNext}
        disabled={!props.hasNext}
      >
        <NextIcon className="w-6 h-6" />
      </ui.Button>
      {props.index == null ? (
        <span className="inline-flex gap-1 items-center text-stone-500">
          No item selected
        </span>
      ) : (
        <span className="inline-flex gap-1 items-center text-stone-500">
          Viewing item{" "}
          <span className="font-bold text-blue-500">{props.index}</span> of{" "}
          <span className="font-bold">{props.total}</span>
        </span>
      )}
    </div>
  );
}
