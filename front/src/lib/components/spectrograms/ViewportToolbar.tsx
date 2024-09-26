import { BackIcon, DragIcon, HomeIcon, ZoomIcon } from "@/lib/components/icons";
import Button from "@/lib/components/ui/Button";
import KeyboardKey from "@/lib/components/ui/KeyboardKey";
import Tooltip from "@/lib/components/ui/Tooltip";

export default function ViewportToolbar({
  mode,
  onDragClick,
  onBackClick,
  onZoomClick,
  onResetClick,
}: {
  mode: "panning" | "zooming" | "idle" | "none";
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
              <KeyboardKey keys={["x"]} />
            </div>
          </div>
        }
        placement="bottom"
      >
        <Button
          variant={mode === "panning" ? "primary" : "secondary"}
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
              <KeyboardKey keys={["z"]} />
            </div>
          </div>
        }
        placement="bottom"
      >
        <Button
          variant={mode === "zooming" ? "primary" : "secondary"}
          onClick={onZoomClick}
        >
          <ZoomIcon className="w-5 h-5" />
        </Button>
      </Tooltip>
    </div>
  );
}
