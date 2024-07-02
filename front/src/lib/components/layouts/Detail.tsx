import type { ReactNode } from "react";

/**
 * A layout component for displaying content with a sidebar.
 *
 * This component provides a flexible layout structure that is particularly
 * suitable for detail views or pages where you want to showcase the main
 * content alongside related information in a sidebar.  The sidebar is sticky,
 * meaning it will remain visible as the user scrolls through the main content.
 */
export default function DetailLayout({
  children,
  sideBar,
}: {
  /** The main content to be displayed. */
  children: ReactNode;
  /** The content to be displayed in the sidebar. */
  sideBar: ReactNode;
}) {
  return (
    <div className="flex flex-row flex-wrap gap-8 justify-between lg:flex-nowrap w-100">
      <div className="grow">{children}</div>
      <div className="flex flex-col flex-none gap-4 max-w-sm">
        <div className="sticky top-8">{sideBar}</div>
      </div>
    </div>
  );
}
