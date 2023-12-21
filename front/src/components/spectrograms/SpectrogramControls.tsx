import Button from "@/components/Button";
import Tooltip from "@/components/Tooltip";
import { DragIcon, HomeIcon, ZoomIcon } from "@/components/icons";
import {
  type SpectrogramState,
  type SpectrogramControls,
} from "@/hooks/spectrogram/useSpectrogram";

export default function SpectrogramControls({
  state,
  controls,
}: {
  state: SpectrogramState;
  controls: SpectrogramControls;
}) {
  return (
    <div className="flex space-x-2">
      <Tooltip tooltip="Reset view" placement="bottom">
        <Button variant="secondary" onClick={controls.reset}>
          <HomeIcon className="w-5 h-5" />
        </Button>
      </Tooltip>
      <Tooltip tooltip="Drag spectrogram" placement="bottom">
        <Button
          variant={state.state == "drag" ? "primary" : "secondary"}
          onClick={() => controls.setState("drag")}
        >
          <DragIcon className="w-5 h-5" />
        </Button>
      </Tooltip>
      <Tooltip tooltip="Zoom to selection" placement="bottom">
        <Button
          variant={state.state == "zoom" ? "primary" : "secondary"}
          onClick={() => controls.setState("zoom")}
        >
          <ZoomIcon className="w-5 h-5" />
        </Button>
      </Tooltip>
    </div>
  );
}
