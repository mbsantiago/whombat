import Card from "@/lib/components/ui/Card";
import { memo } from "react";

const RecordingSpectrogram = memo(function RecordingSpectrogram(props: {
  ViewportToolbar: JSX.Element;
  Player: JSX.Element;
  SettingsMenu: JSX.Element;
  ViewportBar: JSX.Element;
  Canvas: JSX.Element;
}) {
  return (
    <Card>
      <div className="flex flex-row gap-4">
        {props.ViewportToolbar}
        {props.Player}
        {props.SettingsMenu}
      </div>
      {props.Canvas}
      {props.ViewportBar}
    </Card>
  );
});
export default RecordingSpectrogram;
