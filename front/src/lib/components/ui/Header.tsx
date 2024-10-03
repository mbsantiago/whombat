import type { ReactNode } from "react";

/**
 * A generic header component for providing consistent styling and layout to
 * the top section of a page or section.
 *
 * This component is designed to be flexible, allowing you to pass any content
 * as children to customize the header's appearance. It provides a basic
 * background color and padding, along with responsive adjustments for
 * different screen sizes.
 */
export default function Header({ children }: { children: ReactNode }) {
  return (
    <header className="shadow bg-stone-50 dark:bg-stone-800">
      <div className="py-3 px-2 max-w-7xl sm:px-3 lg:px-6">{children}</div>
    </header>
  );
}
