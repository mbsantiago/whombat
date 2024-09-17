import { memo } from "react";
import Card from "@/lib/components/ui/Card";

const ClipAnnotationSpectrogram = memo(
  function ClipAnnotationSpectrogram(props: {
    ViewportToolbar: JSX.Element;
    AnnotationControls: JSX.Element;
    Player: JSX.Element;
    SettingsMenu: JSX.Element;
    ViewportBar: JSX.Element;
    Canvas: JSX.Element;
  }) {
    return (
      <Card>
        <div className="flex flex-row gap-4">
          {props.ViewportToolbar}
          {props.AnnotationControls}
          {props.Player}
          {props.SettingsMenu}
        </div>
        {props.Canvas}
        {props.ViewportBar}
      </Card>
    );
  },
);

export default ClipAnnotationSpectrogram;
