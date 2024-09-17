/**
 * A layout component for displaying content with a sidebar.
 *
 * This component provides a flexible layout structure that is particularly
 * suitable for detail views or pages where you want to showcase the main
 * content alongside related information in a sidebar.  The sidebar is sticky,
 * meaning it will remain visible as the user scrolls through the main content.
 */
export default function DetailLayout({
  MainContent,
  SideBar,
  Actions,
}: {
  /** The main content to be displayed. */
  MainContent: JSX.Element;
  /** The content to be displayed in the sidebar. */
  SideBar: JSX.Element;
  Actions?: JSX.Element;
}) {
  return (
    <div className="flex flex-row flex-wrap gap-8 justify-between md:flex-nowrap w-100">
      <div className="grow">{MainContent}</div>
      <div className="flex flex-col flex-none gap-4 max-w-sm">
        {Actions}
        <div className="sticky top-8 w-full">{SideBar}</div>
      </div>
    </div>
  );
}
