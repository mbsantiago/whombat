import type { ReactNode } from "react";

import Header from "@/lib/components/ui/Header";
import { H1 } from "@/lib/components/ui/Headings";

/**
 * A component for rendering a section header with a tabbed navigation bar.
 *
 * This component is typically used to create visually distinct sections within
 * a page or layout, where each tab represents a different sub-section of the
 * content.
 *
 * Should be used in conjunction with the `Tab` component.
 */
export default function SectionTabs({
  tabs,
  title,
}: {
  /** An array of React elements representing the tabs to be displayed. */
  tabs: ReactNode[];
  /** The title to be displayed in the section header. */
  title?: ReactNode;
}) {
  return (
    <Header>
      <div className="flex overflow-x-auto flex-row space-x-4 w-full">
        {title != null && <H1>{title}</H1>}
        <ul className="flex space-x-4">
          {tabs.map((tab, index) => (
            <li key={index}>{tab}</li>
          ))}
        </ul>
      </div>
    </Header>
  );
}
