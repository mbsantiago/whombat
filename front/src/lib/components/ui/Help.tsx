import classNames from "classnames";
import type { ReactNode } from "react";

import { InfoIcon } from "@/lib/components/icons";

import Button from "./Button";
import Popover from "./Popover";

/**
 * An informational alert component used to display messages to the user.
 *
 * This component is styled to visually convey non-critical information, such
 * as tips, hints, or additional details. It includes an info icon, a visually
 * hidden label for screen readers, and a content area for your message.
 */
export default function Help({
  title,
  className,
  children,
}: {
  title?: string;
  /** The content of the alert message. This is what will be displayed to the
   * user. */
  children: ReactNode;
  /** Additional CSS classes to customize the appearance of the alert. */
  className?: string;
}) {
  return (
    <Popover
      button={
        <Button mode="text" variant="info">
          <InfoIcon className="inline-block w-5 h-5" />
        </Button>
      }
      placement="bottom"
    >
      {() => (
        <div
          className={classNames(
            className,
            "flex items-center p-3 text-sm text-stone-800 border border-stone-300 rounded-lg bg-stone-50 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-800",
          )}
          role="contentinfo"
        >
          <svg
            className="inline flex-shrink-0 mr-3 w-4 h-4"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
          </svg>
          <span className="sr-only">Help</span>
          <div>
            <span className="font-medium">
              {title == null ? "Help" : title}
            </span>{" "}
            {children}
          </div>
        </div>
      )}
    </Popover>
  );
}
