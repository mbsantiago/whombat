import Button from "@/components/Button";
import { DragIcon, ZoomIcon, HomeIcon } from "@/components/icons";

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
      <Button variant="secondary" onClick={onReset}>
        <HomeIcon className="w-5 h-5" />
      </Button>
      <Button variant={isDragging ? "primary" : "secondary"} onClick={onDrag}>
        <DragIcon className="w-5 h-5" />
      </Button>
      <Button variant={isZooming ? "primary" : "secondary"} onClick={onZoom}>
        <ZoomIcon className="w-5 h-5" />
      </Button>
    </div>
  );
}
