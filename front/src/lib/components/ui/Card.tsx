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
        "border flex flex-col gap-3 p-4 rounded-md border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
