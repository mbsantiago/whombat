import DetailLayout from "@/lib/components/layouts/Detail";

/**
  * DatasetDetail component renders the detailed view of a dataset.
  * It uses the DetailLayout component to structure the layout.
1 */
export default function DatasetDetail({
  DatasetUpdate,
  DatasetOverview,
  DatasetTagsSummary,
  DatasetNotesSummary,
}: {
  /** The component for updating the dataset. */
  DatasetUpdate: JSX.Element;
  /** The component for displaying the dataset overview. */
  DatasetOverview: JSX.Element;
  /** The component for displaying the dataset tags summary. */
  DatasetTagsSummary: JSX.Element;
  /** The component for displaying the dataset notes summary. */
  DatasetNotesSummary: JSX.Element;
}) {
  return (
    <DetailLayout sideBar={DatasetUpdate}>
      <div className="grid grid-cols-2 gap-8">
        <div className="col-span-2">{DatasetOverview}</div>
        <div className="col-span-2 xl:col-span-1">{DatasetTagsSummary}</div>
        <div className="col-span-2 xl:col-span-1">{DatasetNotesSummary}</div>
      </div>
    </DetailLayout>
  );
}
