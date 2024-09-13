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
    <div className="flex flex-col gap-4 pb-4">
      {props.RecordingHeader}
      <div className="flex flex-row flex-wrap gap-8 justify-between lg:flex-nowrap w-100">
        <div className="grow">
          <div className="grid grid-cols-2 gap-8">
            <div className="col-span-2">{props.RecordingTagBar}</div>
            <div className="col-span-2">{props.RecordingSpectrogram}</div>
            <div className="col-span-2">{props.RecordingNotes}</div>
          </div>
        </div>
        <div className="flex flex-col flex-none gap-4 max-w-sm">
          {props.RecordingActions}
          {props.RecordingMediaInfo}
          {props.RecordingMap}
        </div>
      </div>
    </div>
  );
}
