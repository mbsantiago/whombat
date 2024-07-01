import Button from "@/components/Button";
import { DragIcon, HomeIcon, ZoomIcon, BackIcon } from "@/components/icons";
import Tooltip from "@/components/Tooltip";
import KeyboardKey from "@/components/KeyboardKey";

export default function ViewportToolbar({
  state,
  onDragClick,
  onBackClick,
  onZoomClick,
  onResetClick,
}: {
  state: "panning" | "zooming" | "idle";
  onResetClick?: () => void;
  onBackClick?: () => void;
  onDragClick?: () => void;
  onZoomClick?: () => void;
}) {
  return (
    <div className="flex space-x-2">
      <Tooltip tooltip="Reset view" placement="bottom">
        <Button variant="secondary" onClick={onResetClick}>
          <HomeIcon className="w-5 h-5" />
        </Button>
      </Tooltip>
      <Tooltip tooltip="Previous view" placement="bottom">
        <Button variant="secondary" onClick={onBackClick}>
          <BackIcon className="w-5 h-5" />
        </Button>
      </Tooltip>
      <Tooltip
        tooltip={
          <div className="inline-flex gap-2 items-center">
            Drag spectrogram
            <div className="text-xs">
              <KeyboardKey code="x" />
            </div>
          </div>
        }
        placement="bottom"
      >
        <Button
          variant={state === "panning" ? "primary" : "secondary"}
          onClick={onDragClick}
        >
          <DragIcon className="w-5 h-5" />
        </Button>
      </Tooltip>
      <Tooltip
        tooltip={
          <div className="inline-flex gap-2 items-center">
            Zoom to selection
            <div className="text-xs">
              <KeyboardKey code="z" />
            </div>
          </div>
        }
        placement="bottom"
      >
        <Button
          variant={state === "zooming" ? "primary" : "secondary"}
          onClick={onZoomClick}
        >
          <ZoomIcon className="w-5 h-5" />
        </Button>
      </Tooltip>
    </div>
  );
}
