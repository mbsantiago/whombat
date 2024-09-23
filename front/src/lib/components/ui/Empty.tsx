import classNames from "classnames";
import type { ReactNode } from "react";

export default function Empty({
  children,
  outerClassName = "p-8",
  className,
}: {
  children: ReactNode;
  outerClassName?: string;
  className?: string;
}) {
  return (
    <div className={`${outerClassName} w-full`}>
      <div
        className={classNames(
          className,
          "flex flex-col justify-center items-center p-4 w-full text-center rounded-md border border-dashed border-stone-500 text-stone-500",
        )}
      >
        {children}
      </div>
    </div>
  );
}
