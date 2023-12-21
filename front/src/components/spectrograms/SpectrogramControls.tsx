import Button from "@/components/Button";
import Tooltip from "@/components/Tooltip";
import { DragIcon, HomeIcon, ZoomIcon } from "@/components/icons";

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
      <Tooltip tooltip="Drag spectrogram" placement="bottom">
        <Button variant={canDrag ? "primary" : "secondary"} onClick={onDrag}>
          <DragIcon className="w-5 h-5" />
        </Button>
      </Tooltip>
      <Tooltip tooltip="Zoom to selection" placement="bottom">
        <Button variant={canZoom ? "primary" : "secondary"} onClick={onZoom}>
          <ZoomIcon className="w-5 h-5" />
        </Button>
      </Tooltip>
    </div>
  );
}
