import Button from "@/components/Button";
import { DragIcon, HomeIcon, ZoomIcon } from "@/components/icons";
import Tooltip from "@/components/Tooltip";
import KeyboardKey from "@/components/KeyboardKey";

export default function SpectrogramControls({
  canDrag,
  canZoom,
  onDrag,
  onZoom,
  onReset,
}: {
  canDrag: boolean;
  canZoom: boolean;
  onReset?: () => void;
  onDrag?: () => void;
  onZoom?: () => void;
}) {
  return (
    <div className="flex space-x-2">
      <Tooltip tooltip="Reset view" placement="bottom">
        <Button variant="secondary" onClick={onReset}>
          <HomeIcon className="w-5 h-5" />
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
        <Button variant={canDrag ? "primary" : "secondary"} onClick={onDrag}>
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
        <Button variant={canZoom ? "primary" : "secondary"} onClick={onZoom}>
          <ZoomIcon className="w-5 h-5" />
        </Button>
      </Tooltip>
    </div>
  );
}
