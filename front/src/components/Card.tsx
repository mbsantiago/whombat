import classNames from "classnames";

import type { HTMLAttributes } from "react";

export default function Card({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={classNames(
        "border shadow flex flex-col gap-3 p-4 rounded-md border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
