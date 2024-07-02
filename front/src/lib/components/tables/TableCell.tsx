import classnames from "classnames";

import { EditIcon } from "@/components/icons";

import type { HTMLProps, ReactNode } from "react";

export default function TableCell({
  children,
  editable = false,
  className,
  ...props
}: { children: ReactNode; editable?: boolean } & HTMLProps<HTMLDivElement>) {
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
      <span className="grow overflow-x-auto">{children}</span>
      {!editable ? null : (
        <EditIcon className="inline-block h-5 w-5 text-stone-500" />
      )}
    </div>
  );
}
