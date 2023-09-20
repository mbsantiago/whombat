import Button from "@/components/Button";
import Tooltip from "@/components/Tooltip";
import { DragIcon, HomeIcon, ZoomIcon } from "@/components/icons";

export default function SpectrogramControls({
  isDragging,
  isZooming,
  onDrag,
  onZoom,
  onReset,
}: {
  isDragging: boolean;
  isZooming: boolean;
  onDrag?: () => void;
  onZoom?: () => void;
  onReset?: () => void;
}) {
  return (
    <div className="flex space-x-2">
      <Tooltip tooltip="Reset view" placement="bottom">
        <Button variant="secondary" onClick={onReset}>
          <HomeIcon className="w-5 h-5" />
        </Button>
      </Tooltip>
      <Tooltip tooltip="Drag spectrogram" placement="bottom">
        <Button variant={isDragging ? "primary" : "secondary"} onClick={onDrag}>
          <DragIcon className="w-5 h-5" />
        </Button>
      </Tooltip>
      <Tooltip tooltip="Zoom to selection" placement="bottom">
        <Button variant={isZooming ? "primary" : "secondary"} onClick={onZoom}>
          <ZoomIcon className="w-5 h-5" />
        </Button>
      </Tooltip>
    </div>
  );
}
