import DetailLayout from "../layouts/Detail";

/**
 * RecordingDetail component renders the detailed view of a recording.
 *
 * It accepts several JSX elements as props to compose the view.
 */
export default function RecordingDetail(props: {
  /** The header component for the recording. */
  RecordingHeader: JSX.Element;
  /** The tag bar component for the recording. */
  RecordingTagBar: JSX.Element;
  /** The spectrogram component for the recording. */
  RecordingSpectrogram: JSX.Element;
  /** The notes component for the recording. */
  RecordingNotes: JSX.Element;
  /** The actions component for the recording. */
  RecordingActions: JSX.Element;
  /** The media info component for the recording. */
  RecordingMediaInfo: JSX.Element;
  /** The map component for the recording. */
  RecordingMap: JSX.Element;
}) {
  return (
    <DetailLayout
      Actions={props.RecordingActions}
      MainContent={
        <div className="grid grid-cols-2 gap-8">
          <div className="col-span-2">{props.RecordingHeader}</div>
          <div className="col-span-2">{props.RecordingTagBar}</div>
          <div className="col-span-2">{props.RecordingSpectrogram}</div>
          <div className="col-span-2">{props.RecordingNotes}</div>
        </div>
      }
      SideBar={
        <div className="flex flex-col flex-none gap-4 max-w-sm">
          {props.RecordingMediaInfo}
          {props.RecordingMap}
        </div>
      }
    />
  );
}
