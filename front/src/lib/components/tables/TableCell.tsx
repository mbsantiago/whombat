import classnames from "classnames";
import type { HTMLProps, ReactNode } from "react";

import { EditIcon } from "@/lib/components/icons";

/**
 * TableCell Component
 *
 * This component renders a table cell that can optionally be editable.
 * It displays the provided children and, if editable, shows an edit icon.
 *
 * If the cell is editable and no `tabIndex` is provided in the props, a
 * `tabIndex` of 0 is added to make the cell focusable.
 *
 * Example usage:
 *
 * ```tsx
 * <TableCell editable={true} className="custom-class">
 *   Cell Content
 * </TableCell>
 * ```
 */
export default function TableCell({
  children,
  editable = false,
  className,
  ...props
}: {
  /** The content to display inside the table cell. */
  children: ReactNode;
  /** If true, the cell is editable and an edit icon is displayed. Default is
   * false.
   **/
  editable?: boolean;
} & HTMLProps<HTMLDivElement>) {
  if (!("tabIndex" in props) && editable) {
    props.tabIndex = 0;
  }
  return (
    <div
      {...props}
      className={classnames(
        "m-0 flex w-full flex-row items-center justify-between gap-2 px-1",
        className,
      )}
    >
      <span className="overflow-x-auto grow">{children}</span>
      {!editable ? null : (
        <EditIcon className="inline-block w-5 h-5 text-stone-500" />
      )}
    </div>
  );
}
